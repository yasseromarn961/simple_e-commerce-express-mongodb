const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'Quantity must be a positive integer'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    unique: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order items count
orderSchema.virtual('itemsCount').get(function() {
  return this.items.length;
});

// Virtual for total quantity
orderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber && this.isNew) {
    // Generate order number: ORD-YYYYMMDD-XXXXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.orderNumber = `ORD-${dateStr}-${randomNum}`;
  }
  next();
});

// Pre-save middleware to calculate subtotals and total
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    // Calculate subtotals for each item
    this.items.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
    
    // Calculate total amount
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  next();
});

// Static method to create order with transaction
orderSchema.statics.createOrderWithTransaction = async function(orderData, session) {
  const { user, items } = orderData;
  
  // Validate and prepare order items
  const Product = mongoose.model('Product');
  const preparedItems = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    
    if (!product) {
      throw new Error(`Product with ID ${item.product} not found`);
    }
    
    if (!product.isActive) {
      throw new Error(`Product ${product.name} is not available`);
    }
    
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }
    
    // Reduce product stock
    product.stock -= item.quantity;
    await product.save({ session });
    
    // Prepare order item
    preparedItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    });
  }
  
  // Calculate total amount
  const totalAmount = preparedItems.reduce((total, item) => total + item.subtotal, 0);
  
  // Create order
  const order = new this({
    user,
    items: preparedItems,
    totalAmount,
    ...orderData
  });
  
  await order.save({ session });
  return order;
};

// Static method to get user orders with pagination
orderSchema.statics.getUserOrders = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { user: userId };
  
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name price sku')
    .populate('user', 'name email');
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = async function(session) {
  if (this.status !== 'pending' && this.status !== 'confirmed') {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  // Restore product stock
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product).session(session);
    if (product) {
      product.stock += item.quantity;
      await product.save({ session });
    }
  }
  
  this.status = 'cancelled';
  await this.save({ session });
};

module.exports = mongoose.model('Order', orderSchema);

/*
Test Case: Create new order
Request: POST /api/v1/orders
Headers: { "Authorization": "Bearer <jwt_token>" }
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
  }
}
Expected: 201 Created, order created, stock reduced

Test Case: Get user orders
Request: GET /api/v1/orders
Headers: { "Authorization": "Bearer <jwt_token>" }
Expected: 200 OK, list of user's orders

Test Case: Get order by ID
Request: GET /api/v1/orders/:id
Headers: { "Authorization": "Bearer <jwt_token>" }
Expected: 200 OK, order details with populated product info
*/