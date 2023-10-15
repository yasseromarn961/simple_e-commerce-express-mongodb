const crypto = require('crypto');

// Generate a secure 6-digit OTP
const generateOTP = () => {
  // Use crypto.randomInt for better security
  return crypto.randomInt(100000, 999999).toString();
};

// Generate OTP with custom length
const generateCustomOTP = (length = 6) => {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10 digits');
  }
  
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  return crypto.randomInt(min, max + 1).toString();
};

// Generate alphanumeric OTP
const generateAlphanumericOTP = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    result += characters[randomIndex];
  }
  
  return result;
};

// Validate OTP format
const validateOTPFormat = (otp, expectedLength = 6) => {
  if (!otp) {
    return {
      isValid: false,
      error: 'OTP is required'
    };
  }
  
  if (typeof otp !== 'string') {
    return {
      isValid: false,
      error: 'OTP must be a string'
    };
  }
  
  if (otp.length !== expectedLength) {
    return {
      isValid: false,
      error: `OTP must be ${expectedLength} digits long`
    };
  }
  
  if (!/^\d+$/.test(otp)) {
    return {
      isValid: false,
      error: 'OTP must contain only digits'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

// Check if OTP is expired
const isOTPExpired = (otpExpires) => {
  if (!otpExpires) {
    return true;
  }
  
  return new Date() > new Date(otpExpires);
};

// Calculate OTP expiration time
const calculateOTPExpiration = (minutesFromNow = 10) => {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
};

// Generate OTP with expiration
const generateOTPWithExpiration = (minutesFromNow = 10) => {
  return {
    otp: generateOTP(),
    expires: calculateOTPExpiration(minutesFromNow)
  };
};

// Verify OTP with timing attack protection
const verifyOTP = (providedOTP, storedOTP, otpExpires) => {
  // Check if OTP is expired first
  if (isOTPExpired(otpExpires)) {
    return {
      isValid: false,
      error: 'OTP has expired'
    };
  }
  
  // Validate OTP format
  const formatValidation = validateOTPFormat(providedOTP);
  if (!formatValidation.isValid) {
    return formatValidation;
  }
  
  // Use crypto.timingSafeEqual to prevent timing attacks
  if (!storedOTP || providedOTP.length !== storedOTP.length) {
    return {
      isValid: false,
      error: 'Invalid OTP'
    };
  }
  
  const providedBuffer = Buffer.from(providedOTP, 'utf8');
  const storedBuffer = Buffer.from(storedOTP, 'utf8');
  
  try {
    const isMatch = crypto.timingSafeEqual(providedBuffer, storedBuffer);
    
    if (!isMatch) {
      return {
        isValid: false,
        error: 'Invalid OTP'
      };
    }
    
    return {
      isValid: true,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid OTP'
    };
  }
};

// Hash OTP for storage (optional security enhancement)
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Generate secure token for additional security
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Rate limiting helper for OTP requests
class OTPRateLimit {
  constructor() {
    this.attempts = new Map();
    this.maxAttempts = 5;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
  }
  
  // Check if user can request OTP
  canRequestOTP(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);
    
    if (!userAttempts) {
      return { allowed: true, remainingAttempts: this.maxAttempts };
    }
    
    // Clean old attempts
    const validAttempts = userAttempts.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    
    if (validAttempts.length < this.maxAttempts) {
      return { 
        allowed: true, 
        remainingAttempts: this.maxAttempts - validAttempts.length 
      };
    }
    
    const oldestAttempt = Math.min(...validAttempts);
    const resetTime = oldestAttempt + this.windowMs;
    
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(resetTime)
    };
  }
  
  // Record OTP request attempt
  recordAttempt(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Add current attempt
    userAttempts.push(now);
    
    // Clean old attempts
    const validAttempts = userAttempts.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    
    this.attempts.set(identifier, validAttempts);
  }
  
  // Clear attempts for user (e.g., after successful verification)
  clearAttempts(identifier) {
    this.attempts.delete(identifier);
  }
}

// Create global rate limiter instance
const otpRateLimit = new OTPRateLimit();

module.exports = {
  generateOTP,
  generateCustomOTP,
  generateAlphanumericOTP,
  validateOTPFormat,
  isOTPExpired,
  calculateOTPExpiration,
  generateOTPWithExpiration,
  verifyOTP,
  hashOTP,
  generateSecureToken,
  OTPRateLimit,
  otpRateLimit
};

/*
Usage Examples:

1. Generate OTP:
   const otp = generateOTP(); // Returns 6-digit string like "123456"

2. Generate OTP with expiration:
   const { otp, expires } = generateOTPWithExpiration(10); // 10 minutes

3. Verify OTP:
   const result = verifyOTP(userProvidedOTP, storedOTP, otpExpires);
   if (result.isValid) {
     // OTP is valid
   } else {
     console.log(result.error);
   }

4. Rate limiting:
   const canRequest = otpRateLimit.canRequestOTP(userEmail);
   if (canRequest.allowed) {
     // Generate and send OTP
     otpRateLimit.recordAttempt(userEmail);
   } else {
     // Too many attempts
   }

5. Custom length OTP:
   const customOTP = generateCustomOTP(8); // 8-digit OTP

6. Alphanumeric OTP:
   const alphaOTP = generateAlphanumericOTP(6); // Like "A1B2C3"
*/