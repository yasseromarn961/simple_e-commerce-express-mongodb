const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

// Helper function to filter multilingual data based on language preference
const filterMultilingualData = (data, language, isBilingual) => {
  if (!data || typeof data !== 'object') return data;
  
  // If bilingual mode, return all languages
  if (isBilingual) return data;
  
  // If single language mode, filter the data
  const filterObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && value.en !== undefined && value.ar !== undefined) {
        // This is a multilingual field
        filtered[key] = value[language] || value.en; // Fallback to English if requested language not available
      } else if (Array.isArray(value)) {
        // Handle arrays
        filtered[key] = value.map(item => filterObject(item));
      } else if (value && typeof value === 'object') {
        // Handle nested objects
        filtered[key] = filterObject(value);
      } else {
        // Regular field
        filtered[key] = value;
      }
    }
    return filtered;
  };
  
  return filterObject(data);
};

// Create new order with transaction (protected)
const createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;
  const userId = req.user._id;

  // Start MongoDB transaction
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Validate and prepare order items
      const preparedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        
        if (!product) {
          throw new AppError(`Product with ID ${item.product} not found`, 404);
        }
        
        if (!product.isActive) {
          throw new AppError(`Product ${product.name} is not available`, 400);
        }
        
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`, 400);
        }
        
        // Calculate item subtotal
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        
        // Reduce product stock
        product.stock -= item.quantity;
        await product.save({ session });
        
        // Prepare order item
        preparedItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });
      }
      
      // Create order
      const orderData = {
        user: userId,
        items: preparedItems,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        notes
      };
      
      const order = new Order(orderData);
      await order.save({ session });
      
      // Populate order with product and user details
      await order.populate([
        { path: 'items.product', select: 'name price sku category' },
        { path: 'user', select: 'name email' }
      ]);
      
      // Filter multilingual data based on language preference
      const orderObj = order.toObject();
      const filteredOrder = filterMultilingualData(orderObj, req.language, req.isBilingual);
      
      res.localizedJson(201, {
        status: 'success',
        message: 'order.created_success',
        data: {
          order: filteredOrder
        }
      });
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    console.error('Order creation error:', error);
    return next(new AppError('order.processing_error', 500));
  } finally {
    await session.endSession();
  }
});

// Get user orders (protected)
const getUserOrders = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const userId = req.user._id;
  
  // Build query
  const query = { user: userId };
  
  if (status) {
    query.status = status;
  }
  
  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  // Execute query
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name price sku category')
      .populate('user', 'name email'),
    Order.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);
  
  // Filter multilingual data based on language preference
  const filteredOrders = orders.map(order => {
    const orderObj = order.toObject();
    return filterMultilingualData(orderObj, req.language, req.isBilingual);
  });
  
  res.localizedJson(200, {
    status: 'success',
    message: 'order.list_retrieved_success',
    data: {
      orders: filteredOrders,
      pagination: {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    }
  });
});

// Get order by ID (protected - owner or admin)
const getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }
  
  // Build query based on user role
  const query = { _id: id };
  if (userRole !== 'admin') {
    query.user = userId; // Non-admin users can only see their own orders
  }
  
  const order = await Order.findOne(query)
    .populate('items.product', 'name price sku category description')
    .populate('user', 'name email');
  
  if (!order) {
    return next(new AppError('order.not_found', 404));
  }
  
  // Filter multilingual data based on language preference
  const orderObj = order.toObject();
  const filteredOrder = filterMultilingualData(orderObj, req.language, req.isBilingual);
  
  res.localizedJson(200, {
    status: 'success',
    message: 'order.retrieved_success',
    data: {
      order: filteredOrder
    }
  });
});

// Update order status (protected - admin only)
const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('order.invalid_status', 400));
  }
  
  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('order.not_found', 404));
  }
  
  // Check if order is cancelled - cancelled orders cannot be reactivated
  if (order.status === 'cancelled') {
    return next(new AppError('order.cancelled_cannot_update', 400));
  }
  
  // If changing status to cancelled, restore stock using transaction
  if (status === 'cancelled') {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Restore product stock
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            await product.save({ session });
          }
        }
        
        // Update order status
        order.status = status;
        await order.save({ session });
      });
    } catch (error) {
      console.error('Order status update error:', error);
      return next(new AppError('order.processing_error', 500));
    } finally {
      await session.endSession();
    }
  } else {
    // Update status normally for non-cancelled statuses
    order.status = status;
    await order.save();
  }
  
  // Populate order details
  await order.populate([
    { path: 'items.product', select: 'name price sku category' },
    { path: 'user', select: 'name email' }
  ]);
  
  // Filter multilingual data based on language preference
  const orderObj = order.toObject();
  const filteredOrder = filterMultilingualData(orderObj, req.language, req.isBilingual);
  
  res.localizedJson(200, {
    status: 'success',
    message: 'order.updated_success',
    data: {
      order: filteredOrder
    }
  });
});

// Cancel order (protected - owner or admin)
const cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }
  
  // Start transaction for stock restoration
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Build query based on user role
      const query = { _id: id };
      if (userRole !== 'admin') {
        query.user = userId; // Non-admin users can only cancel their own orders
      }
      
      const order = await Order.findOne(query).session(session);
      if (!order) {
        throw new AppError('order.not_found', 404);
      }
      
      // Check if order can be cancelled
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new AppError('order.cannot_cancel', 400);
      }
      
      // Restore product stock
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
        }
      }
      
      // Update order status
      order.status = 'cancelled';
      await order.save({ session });
      
      res.localizedJson(200, {
        status: 'success',
        message: 'order.cancelled_success',
        data: {
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount
          }
        }
      });
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    console.error('Order cancellation error:', error);
    return next(new AppError('order.processing_error', 500));
  } finally {
    await session.endSession();
  }
});

// Get all orders (admin only)
const getAllOrders = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    userId,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError('validation.invalid_id', 400));
    }
    query.user = userId;
  }
  
  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  // Execute query
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name price sku category')
      .populate('user', 'name email'),
    Order.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);
  
  // Filter multilingual data based on language preference
  const filteredOrders = orders.map(order => {
    const orderObj = order.toObject();
    return filterMultilingualData(orderObj, req.language, req.isBilingual);
  });
  
  res.localizedJson(200, {
    status: 'success',
    message: 'order.list_retrieved_success',
    data: {
      orders: filteredOrders,
      pagination: {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    }
  });
});

// Get order statistics (admin only)
const getOrderStatistics = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Get total orders and revenue
  const totalStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  res.localizedJson(200, {
    status: 'success',
    message: 'order.list_retrieved_success',
    data: {
      statusStats: stats,
      totalStats: totalStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    }
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStatistics
};

/*
Test Cases:

1. Create order:
   POST /api/v1/orders
   Headers: { "Authorization": "Bearer <token>" }
   Body: {
     "items": [
       { "product": "<product_id>", "quantity": 2 },
       { "product": "<product_id_2>", "quantity": 1 }
     ],
     "shippingAddress": {
       "street": "123 Main St",
       "city": "New York",
       "state": "NY",
       "zipCode": "10001",
       "country": "USA"
     },
     "paymentMethod": "credit_card"
   }
   Expected: 201 Created, stock reduced

2. Get user orders:
   GET /api/v1/orders?page=1&limit=10&status=pending
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, user's orders

3. Get order by ID:
   GET /api/v1/orders/:id
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, order details

4. Update order status (admin):
   PATCH /api/v1/orders/:id/status
   Headers: { "Authorization": "Bearer <admin_token>" }
   Body: { "status": "confirmed" }
   Expected: 200 OK, status updated

5. Cancel order:
   POST /api/v1/orders/:id/cancel
   Headers: { "Authorization": "Bearer <token>" }
   Expected: 200 OK, order cancelled, stock restored

6. Get all orders (admin):
   GET /api/v1/orders/admin/all?page=1&limit=20
   Headers: { "Authorization": "Bearer <admin_token>" }
   Expected: 200 OK, all orders
*/