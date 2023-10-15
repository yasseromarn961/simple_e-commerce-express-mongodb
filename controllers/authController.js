const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { emailHelpers } = require('../services/brevo');
const { otpRateLimit } = require('../utils/otp');
const { AppError, catchAsync } = require('../middleware/errorHandler');

// Register new user
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check rate limiting for OTP requests
  const rateLimitCheck = otpRateLimit.canRequestOTP(email);
  if (!rateLimitCheck.allowed) {
    return next(new AppError('auth.too_many_otp_requests', 429));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('auth.email_already_exists', 400));
  }

  // Create new user
  const user = new User({
    name,
    email,
    password
  });

  // Generate OTP
  const otp = user.generateOTP();

  // Save user
  await user.save();

  // Record OTP attempt
  otpRateLimit.recordAttempt(email);

  // Send verification email
  try {
    await sendVerificationEmail(email, name, otp, req.language || 'en');
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  res.localizedJson(201, {
    status: 'success',
    message: 'auth.registration_success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    }
  });
});

// Verify email with OTP
const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Find user with OTP fields
  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Check if already verified
  if (user.isVerified) {
    return res.localizedJson(200, {
      status: 'success',
      message: 'auth.email_verification_success'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp)) {
    return next(new AppError('auth.invalid_otp', 400));
  }

  // Mark user as verified and clear OTP
  user.isVerified = true;
  user.clearOTP();
  await user.save();

  // Clear rate limiting attempts
  otpRateLimit.clearAttempts(email);

  // Send welcome email
  try {
    await sendWelcomeEmail(email, user.name, req.language);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  res.localizedJson(200, {
    status: 'success',
    message: 'auth.email_verification_success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    }
  });
});

// Login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password +isVerified');
  if (!user) {
    return next(new AppError('auth.invalid_credentials', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('auth.invalid_credentials', 401));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(new AppError('auth.email_not_verified', 401));
  }

  // Generate JWT token
  const token = generateToken(user._id);

  res.localizedJson(200, {
    status: 'success',
    message: 'auth.login_success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

// Get user profile (protected)
const getProfile = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.localizedJson(200, {
    status: 'success',
    message: 'auth.profile_retrieved',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// Forgot password - send reset OTP
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check rate limiting for OTP requests
  const rateLimitCheck = otpRateLimit.canRequestOTP(email);
  if (!rateLimitCheck.allowed) {
    return next(new AppError('auth.too_many_otp_requests', 429));
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.localizedJson(200, {
      status: 'success',
      message: 'auth.password_reset_otp_sent'
    });
  }

  // Generate reset password OTP
  const otp = user.generateResetPasswordOTP();
  await user.save();

  // Record OTP attempt
  otpRateLimit.recordAttempt(email);

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, user.name, otp, req.language || 'en');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return next(new AppError('email.email_send_failed', 500));
  }

  res.localizedJson(200, {
    status: 'success',
    message: 'auth.password_reset_otp_sent'
  });
});

// Reset password with OTP
const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Find user with reset password OTP fields
  const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordExpires');
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Verify reset password OTP
  if (!user.verifyResetPasswordOTP(otp)) {
    return next(new AppError('auth.invalid_otp', 400));
  }

  // Update password and clear reset OTP
  user.password = newPassword;
  user.clearResetPasswordOTP();
  await user.save();

  // Clear rate limiting attempts
  otpRateLimit.clearAttempts(email);

  res.localizedJson(200, {
    status: 'success',
    message: 'auth.password_reset_success'
  });
});

// Resend verification OTP
const resendVerificationOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check rate limiting for OTP requests
  const rateLimitCheck = otpRateLimit.canRequestOTP(email);
  if (!rateLimitCheck.allowed) {
    return next(new AppError('auth.too_many_otp_requests', 429));
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Check if already verified
  if (user.isVerified) {
    return res.localizedJson(200, {
      status: 'success',
      message: 'auth.email_verification_success'
    });
  }

  // Generate new OTP
  const otp = user.generateOTP();
  await user.save();

  // Record OTP attempt
  otpRateLimit.recordAttempt(email);

  // Send verification email
  try {
    await sendVerificationEmail(email, user.name, otp, req.language || 'en');
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return next(new AppError('email.email_send_failed', 500));
  }

  res.localizedJson(200, {
    status: 'success',
    message: 'email.verification_sent'
  });
});

// Update user profile (protected)
const updateProfile = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user._id;
  
  // Validate input
  if (!name || name.trim().length < 2) {
    return next(new AppError('validation.name_required', 400));
  }
  
  // Update user
  const user = await User.findByIdAndUpdate(
    userId,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires');
  
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }
  
  res.localizedJson(200, {
    status: 'success',
    message: 'auth.profile_updated_success',
    data: {
      user
    }
  });
});

// Change password (protected)
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return next(new AppError('validation.passwords_required', 400));
  }
  
  if (newPassword.length < 8) {
    return next(new AppError('validation.password_min_length', 400));
  }
  
  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('auth.current_password_incorrect', 400));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.localizedJson(200, {
    status: 'success',
    message: 'auth.password_changed_success'
  });
});

// Logout (protected)
const logout = catchAsync(async (req, res, next) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can provide a response for consistency
  res.localizedJson(200, {
    status: 'success',
    message: 'auth.logout_success'
  });
});

// Verify token (protected)
const verifyToken = catchAsync(async (req, res, next) => {
  // If we reach here, the token is valid (middleware already verified it)
  const user = req.user;
  
  res.localizedJson(200, {
    status: 'success',
    message: 'auth.token_valid',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  resendVerificationOTP,
  updateProfile,
  changePassword,
  logout,
  verifyToken
};

/*
Test Cases:

1. Register new user:
   POST /api/v1/auth/register
   Body: { "name": "John Doe", "email": "john@test.com", "password": "Pass123!" }
   Expected: 201 Created, OTP sent to email

2. Verify email:
   POST /api/v1/auth/verify-email
   Body: { "email": "john@test.com", "otp": "123456" }
   Expected: 200 OK, user verified

3. Login:
   POST /api/v1/auth/login
   Body: { "email": "john@test.com", "password": "Pass123!" }
   Expected: 200 OK, JWT token returned

4. Get profile:
   GET /api/v1/auth/profile
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, user profile

5. Forgot password:
   POST /api/v1/auth/forgot-password
   Body: { "email": "john@test.com" }
   Expected: 200 OK, reset OTP sent

6. Reset password:
   POST /api/v1/auth/reset-password
   Body: { "email": "john@test.com", "otp": "654321", "newPassword": "NewPass123!" }
   Expected: 200 OK, password reset
*/