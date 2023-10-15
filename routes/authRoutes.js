const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 OTP requests per minute
  message: {
    status: 'error',
    message: 'Too many OTP requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password }
 */
router.post('/register',
  authLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email with OTP
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-email',
  otpLimiter,
  validateEmailVerification,
  handleValidationErrors,
  authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification OTP
 * @access  Public
 * @body    { email }
 */
router.post('/resend-verification',
  otpLimiter,
  validateResendVerification,
  handleValidationErrors,
  authController.resendVerificationOTP
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset OTP
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password',
  otpLimiter,
  validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 * @body    { email, otp, newPassword }
 */
router.post('/reset-password',
  authLimiter,
  validateResetPassword,
  handleValidationErrors,
  authController.resetPassword
);

// Protected routes

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile',
  authenticate,
  authController.getProfile
);

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { name }
 */
router.patch('/profile',
  authenticate,
  authController.updateProfile
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password',
  authenticate,
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout',
  authenticate,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token',
  authenticate,
  authController.verifyToken
);

module.exports = router;

/*
Route Testing Examples:

1. Register:
   POST /api/v1/auth/register
   Body: {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "Password123!"
   }
   Expected: 201 Created, OTP sent to email

2. Verify Email:
   POST /api/v1/auth/verify-email
   Body: {
     "email": "john@example.com",
     "otp": "123456"
   }
   Expected: 200 OK, user verified

3. Login:
   POST /api/v1/auth/login
   Body: {
     "email": "john@example.com",
     "password": "Password123!"
   }
   Expected: 200 OK, JWT token returned

4. Get Profile:
   GET /api/v1/auth/profile
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, user profile

5. Forgot Password:
   POST /api/v1/auth/forgot-password
   Body: { "email": "john@example.com" }
   Expected: 200 OK, reset OTP sent

6. Reset Password:
   POST /api/v1/auth/reset-password
   Body: {
     "email": "john@example.com",
     "otp": "123456",
     "newPassword": "NewPassword123!"
   }
   Expected: 200 OK, password reset
*/