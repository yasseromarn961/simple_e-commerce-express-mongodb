const mongoose = require('mongoose');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB cast errors
const handleCastErrorDB = (err) => {
  const message = `validation.invalid_id`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  let message;
  
  switch (field) {
    case 'email':
      message = 'auth.email_already_exists';
      break;
    case 'sku':
      message = 'product.sku_already_exists';
      break;
    default:
      message = `validation.duplicate_field`;
  }
  
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => {
    if (el.kind === 'required') {
      return `validation.${el.path}_required`;
    }
    if (el.kind === 'min') {
      return `validation.${el.path}_min_value`;
    }
    if (el.kind === 'max') {
      return `validation.${el.path}_max_value`;
    }
    if (el.kind === 'enum') {
      return `validation.${el.path}_invalid_value`;
    }
    return el.message;
  });

  const message = 'validation.validation_failed';
  const error = new AppError(message, 400);
  error.errors = errors;
  return error;
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('auth.invalid_token', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('auth.token_expired', 401);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  const response = {
    status: err.status,
    error: err.message,
    message: err.message,
    stack: err.stack
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.localizedJson(err.statusCode, response);
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      status: err.status,
      error: err.message
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    res.localizedJson(err.statusCode, response);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.localizedJson(500, {
      status: 'error',
      error: 'common.internal_server_error'
    });
  }
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = {
  AppError,
  errorHandler,
  catchAsync
};

/*
Usage Examples:

1. Throwing operational errors:
   throw new AppError('auth.invalid_credentials', 401);

2. Using catchAsync wrapper:
   const getUser = catchAsync(async (req, res, next) => {
     const user = await User.findById(req.params.id);
     if (!user) {
       return next(new AppError('auth.user_not_found', 404));
     }
     res.json({ user });
   });

3. Validation errors:
   if (!email) {
     return next(new AppError('validation.email_required', 400));
   }

4. Multiple validation errors:
   const error = new AppError('validation.validation_failed', 400);
   error.errors = ['validation.email_required', 'validation.password_required'];
   return next(error);
*/