const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  resetPasswordOtp: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Index for email lookup
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiration (10 minutes from now)
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN) * 60 * 1000);
  
  return otp;
};

// Instance method to verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  return this.otp === candidateOTP && this.otpExpires > new Date();
};

// Instance method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

// Instance method to generate reset password OTP
userSchema.methods.generateResetPasswordOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.resetPasswordOtp = otp;
  this.resetPasswordExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN) * 60 * 1000);
  
  return otp;
};

// Instance method to verify reset password OTP
userSchema.methods.verifyResetPasswordOTP = function(candidateOTP) {
  return this.resetPasswordOtp === candidateOTP && this.resetPasswordExpires > new Date();
};

// Instance method to clear reset password OTP
userSchema.methods.clearResetPasswordOTP = function() {
  this.resetPasswordOtp = undefined;
  this.resetPasswordExpires = undefined;
};

module.exports = mongoose.model('User', userSchema);

/*
Test Case: Create new user
Request: POST /api/v1/auth/register
Body: { "name": "John Doe", "email": "john@test.com", "password": "Pass123!" }
Expected: 201 Created, OTP sent to email, user created but not verified

Test Case: Verify email with OTP
Request: POST /api/v1/auth/verify-email
Body: { "email": "john@test.com", "otp": "123456" }
Expected: 200 OK, user marked as verified

Test Case: Login verified user
Request: POST /api/v1/auth/login
Body: { "email": "john@test.com", "password": "Pass123!" }
Expected: 200 OK, JWT token returned
*/