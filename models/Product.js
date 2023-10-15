const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English product name is required'],
      trim: true,
      maxlength: [100, 'English product name cannot exceed 100 characters']
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [100, 'Arabic product name cannot exceed 100 characters']
    }
  },
  description: {
    en: {
      type: String,
      trim: true,
      maxlength: [1000, 'English description cannot exceed 1000 characters']
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [1000, 'Arabic description cannot exceed 1000 characters']
    }
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value >= 0;
      },
      message: 'Stock must be a valid non-negative integer'
    }
  },
  sku: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  unitWeight: {
    type: Number,
    required: false,
    min: [0, 'Unit weight cannot be negative'],
    validate: {
      validator: function(value) {
        return value === null || value === undefined || (Number.isFinite(value) && value >= 0);
      },
      message: 'Unit weight must be a valid positive number'
    }
  },
  brand: {
    en: {
      type: String,
      trim: true,
      maxlength: [50, 'English brand name cannot exceed 50 characters']
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [50, 'Arabic brand name cannot exceed 50 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productionDate: {
    type: Date,
    required: false,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow null/undefined
        return value <= new Date(); // Production date cannot be in the future
      },
      message: 'Production date cannot be in the future'
    }
  },
  expiryDate: {
    type: Date,
    required: false,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow null/undefined
        if (!this.productionDate) return true; // If no production date, allow any expiry date
        return value > this.productionDate; // Expiry date must be after production date
      },
      message: 'Expiry date must be after production date'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ sku: 1 });
productSchema.index({ 
  'name.en': 'text', 
  'name.ar': 'text', 
  'description.en': 'text', 
  'description.ar': 'text',
  'brand.en': 'text',
  'brand.ar': 'text'
});
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ unitWeight: 1 });
productSchema.index({ 'brand.en': 1 });
productSchema.index({ 'brand.ar': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ productionDate: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ productionDate: 1, expiryDate: 1 }); // Compound index for date range queries

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for checking if product is expired
productSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for checking if product is near expiry (within 30 days)
productSchema.virtual('isNearExpiry').get(function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && this.expiryDate > new Date();
});

// Instance method to reduce stock
productSchema.methods.reduceStock = function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.stock;
};

// Instance method to increase stock
productSchema.methods.increaseStock = function(quantity) {
  this.stock += quantity;
  return this.stock;
};

// Static method to find products with sufficient stock
productSchema.statics.findWithStock = function(minStock = 1) {
  return this.find({ stock: { $gte: minStock }, isActive: true });
};

// Static method to find expired products
productSchema.statics.findExpiredProducts = function() {
  return this.find({ 
    expiryDate: { $lt: new Date() },
    isActive: true 
  });
};

// Static method to find products near expiry (within specified days)
productSchema.statics.findNearExpiryProducts = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({ 
    expiryDate: { 
      $gte: new Date(),
      $lte: futureDate 
    },
    isActive: true 
  });
};

// Static method to find products by date range
productSchema.statics.findByDateRange = function(startDate, endDate, dateField = 'productionDate') {
  const query = { isActive: true };
  
  if (startDate || endDate) {
    query[dateField] = {};
    if (startDate) query[dateField].$gte = new Date(startDate);
    if (endDate) query[dateField].$lte = new Date(endDate);
  }
  
  return this.find(query);
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    category,
    minPrice,
    maxPrice
  } = options;

  const query = { isActive: true };

  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  // Category filter
  if (category) {
    query.category = new RegExp(category, 'i');
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email');
};

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    // Generate SKU from English name (preferred) or Arabic name and timestamp
    const timestamp = Date.now().toString().slice(-6);
    const sourceName = this.name.en || this.name.ar || 'PROD';
    const namePrefix = sourceName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4);
    this.sku = `${namePrefix}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);

/*
Test Case: Create new product
Request: POST /api/v1/products
Headers: { "Authorization": "Bearer <jwt_token>" }
Body: { 
  "name": "iPhone 15", 
  "description": "Latest iPhone model", 
  "price": 999.99, 
  "stock": 50, 
  "sku": "IPH15-001",
  "category": "Electronics"
}
Expected: 201 Created, product created successfully

Test Case: Get all products (public)
Request: GET /api/v1/products
Expected: 200 OK, list of all active products

Test Case: Get product by ID
Request: GET /api/v1/products/:id
Expected: 200 OK, product details

Test Case: Update product (protected)
Request: PATCH /api/v1/products/:id
Headers: { "Authorization": "Bearer <jwt_token>" }
Body: { "price": 899.99, "stock": 45 }
Expected: 200 OK, product updated successfully
*/