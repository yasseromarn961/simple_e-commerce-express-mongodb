const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      // Map field names to translation keys
      const fieldTranslations = {
        name: 'validation.name_invalid',
        email: 'validation.email_invalid',
        password: 'validation.password_invalid',
        otp: 'validation.otp_invalid',
        price: 'validation.price_invalid',
        stock: 'validation.stock_invalid',
        sku: 'validation.sku_invalid',
        quantity: 'validation.quantity_invalid'
      };
      
      return fieldTranslations[error.path] || error.msg;
    });
    
    const error = new AppError('validation.validation_failed', 400);
    error.errors = errorMessages;
    return next(error);
  }
  
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('validation.name_required')
    .isLength({ min: 2, max: 50 })
    .withMessage('validation.name_length')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('validation.name_format'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('validation.password_required')
    .isLength({ min: 6, max: 128 })
    .withMessage('validation.password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'i')
    .withMessage('validation.password_strength'),
    
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('validation.password_required'),
    
  handleValidationErrors
];

// Email verification validation
const validateEmailVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  body('otp')
    .notEmpty()
    .withMessage('validation.otp_required')
    .isLength({ min: 6, max: 6 })
    .withMessage('validation.otp_length')
    .isNumeric()
    .withMessage('validation.otp_format'),
    
  handleValidationErrors
];

// Forgot password validation
// Resend verification validation - only email required
const validateResendVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.email_required')
    .isEmail()
    .withMessage('validation.email_invalid')
    .normalizeEmail(),
    
  body('otp')
    .notEmpty()
    .withMessage('validation.otp_required')
    .isLength({ min: 6, max: 6 })
    .withMessage('validation.otp_length')
    .isNumeric()
    .withMessage('validation.otp_format'),
    
  body('newPassword')
    .notEmpty()
    .withMessage('validation.password_required')
    .isLength({ min: 6, max: 128 })
    .withMessage('validation.password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'i')
    .withMessage('validation.password_strength'),
    
  handleValidationErrors
];

// Product creation validation
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('validation.name_required')
    .isLength({ min: 2, max: 100 })
    .withMessage('validation.name_length'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('validation.description_length'),
    
  body('price')
    .notEmpty()
    .withMessage('validation.price_required')
    .isFloat({ min: 0 })
    .withMessage('validation.price_invalid')
    .toFloat(),
    
  body('stock')
    .notEmpty()
    .withMessage('validation.stock_required')
    .isInt({ min: 0 })
    .withMessage('validation.stock_invalid')
    .toInt(),
    
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('validation.sku_required')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('validation.sku_format')
    .toUpperCase(),
    
  body('category')
    .notEmpty()
    .withMessage('Product category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  body('unitWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit weight must be a positive number')
    .toFloat(),
    
  body('brand.en')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('English brand name cannot exceed 50 characters'),
    
  body('brand.ar')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Arabic brand name cannot exceed 50 characters'),

  body('brandAr')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Arabic brand name cannot exceed 50 characters'),

  handleValidationErrors
];

// Product update validation
const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('validation.name_required')
    .isLength({ min: 2, max: 100 })
    .withMessage('validation.name_length'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('validation.description_length'),
    
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('validation.price_invalid')
    .toFloat(),
    
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('validation.stock_invalid')
    .toInt(),
    
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  body('unitWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit weight must be a positive number')
    .toFloat(),
    
  body('brand.en')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('English brand name cannot exceed 50 characters'),
    
  body('brand.ar')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Arabic brand name cannot exceed 50 characters'),

  body('brandAr')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Arabic brand name cannot exceed 50 characters'),

  handleValidationErrors
];

// Create order validation
const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('validation.items_required'),
    
  body('items.*.product')
    .notEmpty()
    .withMessage('validation.product_required')
    .isMongoId()
    .withMessage('validation.product_invalid'),
    
  body('items.*.quantity')
    .notEmpty()
    .withMessage('validation.quantity_required')
    .isInt({ min: 1 })
    .withMessage('validation.quantity_invalid')
    .toInt(),
    
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('validation.shipping_address_invalid'),
    
  body('shippingAddress.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('validation.street_required'),
    
  body('shippingAddress.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('validation.city_required'),
    
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
    .withMessage('validation.payment_method_invalid'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('validation.notes_length'),
    
  handleValidationErrors
];

// Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('validation.invalid_id'),
    
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('validation.page_invalid')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('validation.limit_invalid')
    .toInt(),
    
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'updatedAt'])
    .withMessage('validation.sort_by_invalid'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('validation.sort_order_invalid'),
    
  handleValidationErrors
];

// Validate update order status
const validateUpdateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('validation.invalid_order_status'),

  handleValidationErrors
];

// User role validation
const validateUpdateUserRole = [
  body('role')
    .notEmpty()
    .withMessage('validation.role_required')
    .isIn(['user', 'admin'])
    .withMessage('validation.role_invalid'),

  handleValidationErrors
];

// User status validation
const validateUpdateUserStatus = [
  body('isActive')
    .notEmpty()
    .withMessage('validation.status_required')
    .isBoolean()
    .withMessage('validation.status_invalid')
    .toBoolean(),

  handleValidationErrors
];

// Category validation
const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  
  body('nameAr')
    .trim()
    .notEmpty()
    .withMessage('Arabic category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Arabic category name must be between 2 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('descriptionAr')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic description cannot exceed 500 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  handleValidationErrors
];

const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  
  body('nameAr')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Arabic category name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Arabic category name must be between 2 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('descriptionAr')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic description cannot exceed 500 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

const validateCategorySortOrder = [
  body('categories')
    .isArray({ min: 1 })
    .withMessage('Categories array is required and must not be empty'),
  
  body('categories.*.id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('categories.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateUpdateUserRole,
  validateUpdateUserStatus,
  validateObjectId,
  validatePagination,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategorySortOrder
};

/*
Usage Examples:

1. In routes:
   router.post('/register', validateUserRegistration, register);
   router.post('/login', validateUserLogin, login);
   router.post('/products', authenticate, validateProductCreation, createProduct);

2. Custom validation:
   const customValidation = [
     body('customField').custom((value) => {
       if (value !== 'expected') {
         throw new Error('validation.custom_field_invalid');
       }
       return true;
     }),
     handleValidationErrors
   ];
*/