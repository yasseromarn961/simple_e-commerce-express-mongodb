const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getCategoriesWithStats,
  getCategoryStatistics,
  updateCategorySortOrder
} = require('../controllers/categoryController');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategorySortOrder,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
// Get all active categories
router.get('/public', validatePagination, getAllCategories);

// Get categories with product statistics (public)
router.get('/public/stats', getCategoriesWithStats);

// Get category by ID (public)
router.get('/public/:id', validateObjectId('id'), getCategoryById);

// Protected routes (authentication required)
// Get all categories (including inactive ones for admin)
router.get('/', authenticate, validatePagination, getAllCategories);

// Get category by ID
router.get('/:id', authenticate, validateObjectId('id'), getCategoryById);

// ========================================
// ADMIN ONLY ROUTES (requireAdmin middleware)
// ========================================

// Create new category - ADMIN ONLY
router.post('/', 
  authenticate, 
  requireAdmin, // Admin access required
  validateCreateCategory, 
  createCategory
);

// Update category - ADMIN ONLY
router.put('/:id', 
  authenticate, 
  requireAdmin, // Admin access required
  validateObjectId('id'), 
  validateUpdateCategory, 
  updateCategory
);

// Delete category (soft delete) - ADMIN ONLY
router.delete('/:id', 
  authenticate, 
  requireAdmin, // Admin access required
  validateObjectId('id'), 
  deleteCategory
);

// Restore deleted category - ADMIN ONLY
router.patch('/:id/restore', 
  authenticate, 
  requireAdmin, // Admin access required
  validateObjectId('id'), 
  restoreCategory
);

// Get category statistics for admin dashboard - ADMIN ONLY
router.get('/admin/statistics', 
  authenticate, 
  requireAdmin, // Admin access required
  getCategoryStatistics
);

// Update categories sort order - ADMIN ONLY
router.patch('/admin/sort-order', 
  authenticate, 
  requireAdmin, // Admin access required
  validateCategorySortOrder, 
  updateCategorySortOrder
);

module.exports = router;