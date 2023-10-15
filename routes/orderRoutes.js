const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateObjectId,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User order routes

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 * @body    { items: [{ product, quantity }], shippingAddress, paymentMethod?, notes? }
 */
router.post('/',
  validateCreateOrder,
  handleValidationErrors,
  orderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 * @query   page, limit, status, sortBy, sortOrder
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  orderController.getUserOrders
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID (owner or admin)
 * @access  Private
 * @param   id - Order ID
 */
router.get('/:id',
  validateObjectId('id'),
  handleValidationErrors,
  orderController.getOrderById
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order (owner or admin)
 * @access  Private
 * @param   id - Order ID
 */
router.post('/:id/cancel',
  validateObjectId('id'),
  handleValidationErrors,
  orderController.cancelOrder
);

// Admin-only routes

/**
 * @route   GET /api/v1/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 * @query   page, limit, status, userId, sortBy, sortOrder
 */
router.get('/admin/all',
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  orderController.getAllOrders
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 * @param   id - Order ID
 * @body    { status }
 */
router.patch('/:id/status',
  requireAdmin,
  validateObjectId('id'),
  validateUpdateOrderStatus,
  handleValidationErrors,
  orderController.updateOrderStatus
);

/**
 * @route   GET /api/v1/orders/admin/stats
 * @desc    Get order statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats',
  requireAdmin,
  orderController.getOrderStatistics
);

module.exports = router;

/*
Route Testing Examples:

1. Create order:
   POST /api/v1/orders
   Headers: { "Authorization": "Bearer <token>" }
   Body: {
     "items": [
       {
         "product": "60d5ecb74b24a1234567890a",
         "quantity": 2
       },
       {
         "product": "60d5ecb74b24a1234567890b",
         "quantity": 1
       }
     ],
     "shippingAddress": {
       "street": "123 Main Street",
       "city": "New York",
       "state": "NY",
       "zipCode": "10001",
       "country": "USA"
     },
     "paymentMethod": "credit_card",
     "notes": "Please deliver during business hours"
   }
   Expected: 201 Created, order created with transaction

2. Get user orders:
   GET /api/v1/orders?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, user's orders with pagination

3. Get order by ID:
   GET /api/v1/orders/60d5ecb74b24a1234567890c
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, order details (if owner or admin)

4. Cancel order:
   POST /api/v1/orders/60d5ecb74b24a1234567890c/cancel
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, order cancelled, stock restored

5. Get all orders (Admin):
   GET /api/v1/orders/admin/all?page=1&limit=20&status=confirmed&userId=60d5ecb74b24a1234567890d
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, all orders with filters

6. Update order status (Admin):
   PATCH /api/v1/orders/60d5ecb74b24a1234567890c/status
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: {
     "status": "shipped"
   }
   Expected: 200 OK, order status updated

7. Get order statistics (Admin):
   GET /api/v1/orders/admin/stats
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, order statistics and revenue data

Order Status Flow:
pending -> confirmed -> processing -> shipped -> delivered
                    \-> cancelled (from pending/confirmed only)

Valid Order Statuses:
- pending: Order placed, awaiting confirmation
- confirmed: Order confirmed, ready for processing
- processing: Order being prepared
- shipped: Order shipped to customer
- delivered: Order delivered successfully
- cancelled: Order cancelled (stock restored)
*/