const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.token_required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.userId).select('+isVerified');
    
    if (!user) {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.user_not_found'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.email_not_verified'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.invalid_token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.token_expired'
      });
    }

    console.error('Authentication error:', error);
    return res.localizedJson(500, {
      status: 'error',
      error: 'common.internal_server_error'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.localizedJson(401, {
      status: 'error',
      error: 'auth.authentication_required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.localizedJson(403, {
      status: 'error',
      error: 'auth.admin_access_required'
    });
  }

  next();
};

// Middleware to check resource ownership or admin access
const requireOwnershipOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.localizedJson(401, {
        status: 'error',
        error: 'auth.authentication_required'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // For non-admin users, check ownership
    // This will be used in controllers where we have access to the resource
    req.requireOwnership = true;
    req.resourceUserField = resourceUserField;
    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+isVerified');
    
    if (user && user.isVerified) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

// Utility function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Utility function to verify token without middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth,
  generateToken,
  verifyToken
};

/*
Usage Examples:

1. Protected route (requires authentication):
   router.get('/profile', authenticate, getUserProfile);

2. Admin only route:
   router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

3. Resource ownership or admin access:
   router.patch('/orders/:id', authenticate, requireOwnershipOrAdmin('user'), updateOrder);

4. Optional authentication:
   router.get('/products', optionalAuth, getProducts);

5. Generate token:
   const token = generateToken(user._id);

6. Verify token:
   const decoded = verifyToken(token);
*/