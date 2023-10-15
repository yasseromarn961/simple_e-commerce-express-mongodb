const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateObjectId,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Public routes

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering, pagination, and search
 * @access  Public
 * @query   page, limit, category, minPrice, maxPrice, search, sortBy, sortOrder, inStock
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  productController.getAllProducts
);

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products by name or description
 * @access  Public
 * @query   q (search query), page, limit
 */
router.get('/search',
  validatePagination,
  handleValidationErrors,
  productController.searchProducts
);

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories',
  productController.getCategories
);

/**
 * @route   GET /api/v1/products/category/:category
 * @desc    Get products by category
 * @access  Public
 * @param   category - Product category
 */
router.get('/category/:categoryId',
  validatePagination,
  handleValidationErrors,
  productController.getProductsByCategory
);



/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 * @param   id - Product ID
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  productController.getProductById
);

// Protected routes

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 * @body    { name, description, price, stock, category }
 */
router.post('/',
  authenticate,
  requireAdmin,
  validateCreateProduct,
  handleValidationErrors,
  productController.createProduct
);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 * @param   id - Product ID
 * @body    { name?, description?, price?, stock?, category?, isActive? }
 */
router.patch('/:id',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  validateUpdateProduct,
  handleValidationErrors,
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Soft delete product (set isActive to false)
 * @access  Private (Admin only)
 * @param   id - Product ID
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  handleValidationErrors,
  productController.deleteProduct
);

/**
 * @route   PATCH /api/v1/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Admin only)
 * @param   id - Product ID
 * @body    { stock, operation? }
 */
router.patch('/:id/stock',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  handleValidationErrors,
  productController.updateStock
);

/**
 * @route   POST /api/v1/products/:id/restore
 * @desc    Restore soft-deleted product
 * @access  Private (Admin only)
 * @param   id - Product ID
 */
router.post('/:id/restore',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  handleValidationErrors,
  productController.restoreProduct
);

/**
 * @route   GET /api/v1/products/admin/all
 * @desc    Get all products including inactive ones (Admin only)
 * @access  Private (Admin only)
 * @query   page, limit, category, minPrice, maxPrice, search, sortBy, sortOrder, isActive
 */
router.get('/admin/all',
  authenticate,
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  productController.getAllProductsAdmin
);

/**
 * @route   GET /api/v1/products/admin/stats
 * @desc    Get product statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats',
  authenticate,
  requireAdmin,
  productController.getProductStats
);

/**
 * @route   GET /api/v1/products/admin/expired
 * @desc    Get expired products (admin only)
 * @access  Private (Admin)
 * @query   page, limit
 */
router.get('/admin/expired',
  authenticate,
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  productController.getExpiredProducts
);

/**
 * @route   GET /api/v1/products/admin/near-expiry
 * @desc    Get products near expiry (admin only)
 * @access  Private (Admin)
 * @query   page, limit, days
 */
router.get('/admin/near-expiry',
  authenticate,
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  productController.getNearExpiryProducts
);

/**
 * @route   GET /api/v1/products/admin/date-range
 * @desc    Get products by date range (admin only)
 * @access  Private (Admin)
 * @query   startDate, endDate, dateField, page, limit
 */
router.get('/admin/date-range',
  authenticate,
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  productController.getProductsByDateRange
);

module.exports = router;

/*
Route Testing Examples:

1. Get all products:
   GET /api/v1/products?page=1&limit=10&category=electronics&minPrice=100&maxPrice=1000
   Expected: 200 OK, paginated products

2. Search products:
   GET /api/v1/products/search?q=laptop&page=1&limit=5
   Expected: 200 OK, matching products

3. Get product by ID:
   GET /api/v1/products/60d5ecb74b24a1234567890a
   Expected: 200 OK, product details

4. Create product (Admin):
   POST /api/v1/products
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "name": "Gaming Laptop",
     "description": "High-performance gaming laptop",
     "price": 1299.99,
     "stock": 50,
     "category": "electronics"
   }
   Expected: 201 Created, product created

5. Update product (Admin):
   PATCH /api/v1/products/60d5ecb74b24a1234567890a
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "price": 1199.99,
     "stock": 45
   }
   Expected: 200 OK, product updated

6. Delete product (Admin):
   DELETE /api/v1/products/60d5ecb74b24a1234567890a
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, product soft deleted

7. Update stock (Admin):
   PATCH /api/v1/products/60d5ecb74b24a1234567890a/stock
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "stock": 10,
     "operation": "add"
   }
   Expected: 200 OK, stock updated

8. Get categories:
   GET /api/v1/products/categories
   Expected: 200 OK, list of categories

9. Get products by category:
   GET /api/v1/products/category/electronics?page=1&limit=10
   Expected: 200 OK, electronics products

10. Get admin stats:
    GET /api/v1/products/admin/stats
    Headers: { "Authorization": "Bearer <admin_token>" }
    Expected: 200 OK, product statistics
*/