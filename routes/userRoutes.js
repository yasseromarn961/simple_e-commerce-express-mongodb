const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  validateObjectId,
  validatePagination,
  validateUpdateUserRole,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All user management routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 * @query   page, limit, role, isVerified, search, sortBy, sortOrder
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/statistics
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/statistics',
  userController.getUserStatistics
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 * @param   id - User ID
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  userController.getUserById
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 * @param   id - User ID
 * @body    { role }
 */
router.patch('/:id/role',
  validateObjectId('id'),
  validateUpdateUserRole,
  handleValidationErrors,
  userController.updateUserRole
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin only)
 * @param   id - User ID
 * @body    { isActive }
 */
router.patch('/:id/status',
  validateObjectId('id'),
  handleValidationErrors,
  userController.updateUserStatus
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 * @param   id - User ID
 */
router.delete('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  userController.deleteUser
);



module.exports = router;

/*
Route Testing Examples:

1. Get all users:
   GET /api/v1/users?page=1&limit=10&role=user&isVerified=true
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, list of users with pagination

2. Get user by ID:
   GET /api/v1/users/60d5ecb74b24a1234567890a
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, user details

3. Update user role:
   PATCH /api/v1/users/60d5ecb74b24a1234567890a/role
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "role": "admin"
   }
   Expected: 200 OK, user role updated

4. Update user status:
   PATCH /api/v1/users/60d5ecb74b24a1234567890a/status
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "isActive": false
   }
   Expected: 200 OK, user deactivated

5. Delete user:
   DELETE /api/v1/users/60d5ecb74b24a1234567890a
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, user soft deleted

6. Get user statistics:
   GET /api/v1/users/stats
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, user statistics

Available Roles:
- user: Regular user (default)
- admin: Administrator with full access

User Status:
- isActive: true/false (active/inactive)
- isVerified: true/false (email verified/not verified)
*/