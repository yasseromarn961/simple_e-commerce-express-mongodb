const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

// Helper function to get localized response based on Accept-Language header
const getLocalizedResponse = (data, language) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => getLocalizedResponse(item, language));
  }
  
  if (typeof data === 'object' && data !== null) {
    const result = { ...data };
    
    // Handle name field
    if (data.name && typeof data.name === 'object') {
      if (language === 'ar' && data.name.ar) {
        result.name = data.name.ar;
      } else if (language === 'en' && data.name.en) {
        result.name = data.name.en;
      } else if (!language) {
        // Return both languages if no language specified
        result.name = data.name;
      } else {
        // Fallback to available language
        result.name = data.name.en || data.name.ar;
      }
    }
    
    // Handle description field
    if (data.description && typeof data.description === 'object') {
      if (language === 'ar' && data.description.ar) {
        result.description = data.description.ar;
      } else if (language === 'en' && data.description.en) {
        result.description = data.description.en;
      } else if (!language) {
        // Return both languages if no language specified
        result.description = data.description;
      } else {
        // Fallback to available language
        result.description = data.description.en || data.description.ar;
      }
    }
    
    // Handle brand field
    if (data.brand && typeof data.brand === 'object') {
      if (language === 'ar' && data.brand.ar) {
        result.brand = data.brand.ar;
      } else if (language === 'en' && data.brand.en) {
        result.brand = data.brand.en;
      } else if (!language) {
        // Return both languages if no language specified
        result.brand = data.brand;
      } else {
        // Fallback to available language
        result.brand = data.brand.en || data.brand.ar;
      }
    }
    
    // Handle nested category object
    if (data.category && typeof data.category === 'object') {
      result.category = getLocalizedResponse(data.category, language);
    }
    
    return result;
  }
  
  return data;
};

// Create new product (protected)
const createProduct = catchAsync(async (req, res, next) => {
  const { name, nameAr, description, descriptionAr, price, stock, sku, category, unitWeight, brand, brandAr, productionDate, expiryDate } = req.body;

  // Transform data to new structure
  const productData = {
    name: {
      en: name,
      ar: nameAr
    },
    description: {
      en: description,
      ar: descriptionAr
    },
    price,
    stock,
    sku,
    category,
    createdBy: req.user._id
  };

  // Add optional unitWeight if provided
  if (unitWeight !== undefined && unitWeight !== null) {
    productData.unitWeight = unitWeight;
  }

  // Add optional brand if provided
  if (brand || brandAr) {
    productData.brand = {
      en: '',
      ar: ''
    };
    
    if (typeof brand === 'string') {
      // If brand is sent as string, treat it as English
      productData.brand.en = brand;
    } else if (typeof brand === 'object') {
      // If brand is sent as object with en/ar properties
      productData.brand.en = brand.en || '';
      productData.brand.ar = brand.ar || '';
    }
    
    // Handle brandAr separately
    if (brandAr) {
      productData.brand.ar = brandAr;
    }
  }

  // Add optional date fields if provided
  if (productionDate) {
    productData.productionDate = new Date(productionDate);
  }
  if (expiryDate) {
    productData.expiryDate = new Date(expiryDate);
  }

  // Create product with user reference
  const product = new Product(productData);

  await product.save();

  // Populate creator info and category
  await product.populate('createdBy', 'name email');
  await product.populate('category', 'name description slug isActive');

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProduct = getLocalizedResponse(product.toObject(), language);

  res.localizedJson(201, {
    status: 'success',
    message: 'product.created_success',
    data: {
      product: localizedProduct
    }
  });
});

// Get all products (public with optional filters)
const getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    inStock
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Search filter
  if (search) {
    query.$or = [
      { 'name.en': { $regex: search, $options: 'i' } },
      { 'name.ar': { $regex: search, $options: 'i' } },
      { 'description.en': { $regex: search, $options: 'i' } },
      { 'description.ar': { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    // Check if category is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      // Use regex for string search
      query.category = { $regex: category, $options: 'i' };
    }
  }

  // Brand filter
  if (brand) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { 'brand.en': { $regex: brand, $options: 'i' } },
        { 'brand.ar': { $regex: brand, $options: 'i' } }
      ]
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
  }

  // Stock filter
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  } else if (inStock === 'false') {
    query.stock = 0;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('category', 'name nameAr description descriptionAr slug isActive'),
    Product.countDocuments(query)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(products.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.list_retrieved_success',
    data: {
      products: localizedProducts,
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

// Get product by ID (public)
const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }

  const product = await Product.findOne({ _id: id, isActive: true })
    .populate('createdBy', 'name email')
    .populate('category', 'name nameAr description descriptionAr slug isActive');

  if (!product) {
    return next(new AppError('product.not_found', 404));
  }

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProduct = getLocalizedResponse(product.toObject(), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.retrieved_success',
    data: {
      product: localizedProduct
    }
  });
});

// Update product (protected - owner or admin)
const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }

  // Find product
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    return next(new AppError('product.not_found', 404));
  }

  // Check ownership or admin access
  if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('product.access_denied', 403));
  }

  // Remove fields that shouldn't be updated
  delete updates.createdBy;
  delete updates._id;
  delete updates.__v;

  // Handle date fields conversion
  if (updates.productionDate) {
    updates.productionDate = new Date(updates.productionDate);
  }
  if (updates.expiryDate) {
    updates.expiryDate = new Date(updates.expiryDate);
  }

  // Handle unitWeight
  if (updates.unitWeight !== undefined) {
    if (updates.unitWeight === null || updates.unitWeight === '') {
      updates.unitWeight = undefined;
    }
  }

  // Handle brand field
  if (updates.brand !== undefined || updates.brandAr !== undefined) {
    // Initialize brand object if it doesn't exist
    if (!updates.brand || typeof updates.brand !== 'object') {
      updates.brand = {
        en: product.brand?.en || '',
        ar: product.brand?.ar || ''
      };
    }
    
    if (typeof updates.brand === 'string') {
      // If brand is sent as string, treat it as English
      updates.brand = {
        en: updates.brand,
        ar: product.brand?.ar || ''
      };
    } else if (updates.brand === null || updates.brand === '') {
      updates.brand = undefined;
    }
    
    // Handle brandAr separately
    if (updates.brandAr !== undefined) {
      if (updates.brand && typeof updates.brand === 'object') {
        updates.brand.ar = updates.brandAr;
      } else {
        updates.brand = {
          en: product.brand?.en || '',
          ar: updates.brandAr
        };
      }
      delete updates.brandAr;
    }
  }

  // Transform name and description if provided in old format
  if (updates.name && typeof updates.name === 'string') {
    updates.name = {
      en: updates.name,
      ar: updates.nameAr || product.name.ar
    };
    delete updates.nameAr;
  }
  if (updates.description && typeof updates.description === 'string') {
    updates.description = {
      en: updates.description,
      ar: updates.descriptionAr || product.description.ar
    };
    delete updates.descriptionAr;
  }

  // Update product
  Object.assign(product, updates);
  await product.save();

  // Populate creator info and category
  await product.populate('createdBy', 'name email');
  await product.populate('category', 'name nameAr description descriptionAr slug isActive');

  res.localizedJson(200, {
    status: 'success',
    message: 'product.updated_success',
    data: {
      product
    }
  });
});

// Delete product (protected - owner or admin)
const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }

  // Find product
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    return next(new AppError('product.not_found', 404));
  }

  // Check ownership or admin access
  if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('product.access_denied', 403));
  }

  // Soft delete by setting isActive to false
  product.isActive = false;
  await product.save();

  res.localizedJson(200, {
    status: 'success',
    message: 'product.deleted_success'
  });
});

// Get products by category (public)
const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(new AppError('validation.invalid_id', 400));
  }

  const query = {
    category: categoryId,
    isActive: true
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('category', 'name nameAr description descriptionAr slug isActive'),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(products.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.list_retrieved_success',
    data: {
      products: localizedProducts,
      categoryId,
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

// Search products (public)
const searchProducts = catchAsync(async (req, res, next) => {
  const { q: searchTerm } = req.query;
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  if (!searchTerm) {
    return next(new AppError('validation.search_term_required', 400));
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  };

  const products = await Product.searchProducts(searchTerm, options);
  const total = await Product.countDocuments({
    $text: { $search: searchTerm },
    isActive: true
  });

  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(products.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.list_retrieved_success',
    data: {
      products: localizedProducts,
      searchTerm,
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

// Get product categories (public)
const getCategories = catchAsync(async (req, res, next) => {
  const Category = require('../models/Category');
  
  // Get unique category IDs from products
  const categoryIds = await Product.distinct('category', { isActive: true });
  
  // Get full category information
  const categories = await Category.find({
    _id: { $in: categoryIds },
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedCategories = getLocalizedResponse(categories.map(c => c.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.list_retrieved_success',
    data: {
      categories: localizedCategories,
      count: localizedCategories.length
    }
  });
});

// Update product stock (protected - owner or admin)
const updateStock = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { stock, operation } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('validation.invalid_id', 400));
  }

  // Validate stock
  if (stock === undefined || stock < 0 || !Number.isInteger(stock)) {
    return next(new AppError('validation.stock_invalid', 400));
  }

  // Validate operation if provided
  const validOperations = ['add', 'subtract', 'set'];
  if (operation && !validOperations.includes(operation)) {
    return next(new AppError('validation.operation_invalid', 400));
  }

  // Find product
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    return next(new AppError('product.not_found', 404));
  }

  // Check ownership or admin access
  if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('product.access_denied', 403));
  }

  // Store original stock for response
  const originalStock = product.stock;
  let newStock;

  // Apply stock operation
  switch (operation) {
    case 'add':
      newStock = originalStock + stock;
      break;
    case 'subtract':
      newStock = originalStock - stock;
      if (newStock < 0) {
        return next(new AppError('validation.insufficient_stock', 400));
      }
      break;
    case 'set':
      newStock = stock;
      break;
    default:
      // If no operation specified, treat as 'set'
      newStock = stock;
      break;
  }

  // Update stock
  product.stock = newStock;
  await product.save();

  res.localizedJson(200, {
    status: 'success',
    message: 'product.stock_updated',
    data: {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        previousStock: originalStock,
        currentStock: product.stock,
        operation: operation || 'set',
        stockChange: operation === 'add' ? `+${stock}` : operation === 'subtract' ? `-${stock}` : `set to ${stock}`
      }
    }
  });
});

// Restore soft-deleted product (admin only)
const restoreProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('product.not_found', 404));
  }
  
  product.isActive = true;
  await product.save();
  
  res.localizedJson(200, {
    status: 'success',
    message: 'product.restored_success',
    data: {
      product
    }
  });
});

// Get all products including inactive ones (admin only)
const getAllProductsAdmin = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isActive
  } = req.query;
  
  // Build query
  const query = {};
  
  if (category) {
    query.category = new RegExp(category, 'i');
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('category', 'name nameAr description descriptionAr slug isActive'),
    Product.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(products.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'product.list_retrieved_success',
    data: {
      products: localizedProducts,
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

// Get product statistics (admin only)
const getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactiveProducts: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }
    }
  ]);
  
  // Get category statistics
  const categoryStats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // Get low stock products
  const lowStockProducts = await Product.find({
    isActive: true,
    stock: { $lte: 10 }
  }).select('name sku stock category').sort({ stock: 1 }).limit(10);
  
  res.localizedJson(200, {
    status: 'success',
    message: 'product.stats_retrieved_success',
    data: {
      overview: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        totalStock: 0,
        averagePrice: 0,
        totalValue: 0
      },
      categoryStats,
      lowStockProducts
    }
  });
});

// Get expired products (admin only)
const getExpiredProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const expiredProducts = await Product.findExpiredProducts()
    .populate('category', 'name description slug')
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ expiryDate: 1 });

  const total = await Product.countDocuments({
    expiryDate: { $lt: new Date() },
    isActive: true
  });

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(expiredProducts.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'products.expired_retrieved',
    data: {
      products: localizedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get products near expiry (admin only)
const getNearExpiryProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, days = 30 } = req.query;
  const skip = (page - 1) * limit;

  const nearExpiryProducts = await Product.findNearExpiryProducts(parseInt(days))
    .populate('category', 'name description slug')
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ expiryDate: 1 });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));
  
  const total = await Product.countDocuments({
    expiryDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    isActive: true
  });

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(nearExpiryProducts.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'products.near_expiry_retrieved',
    data: {
      products: localizedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get products by date range
const getProductsByDateRange = catchAsync(async (req, res, next) => {
  const { startDate, endDate, dateField = 'productionDate', page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const products = await Product.findByDateRange(startDate, endDate, dateField)
    .populate('category', 'name description slug')
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ [dateField]: -1 });

  // Build count query
  const countQuery = { isActive: true };
  if (startDate || endDate) {
    countQuery[dateField] = {};
    if (startDate) countQuery[dateField].$gte = new Date(startDate);
    if (endDate) countQuery[dateField].$lte = new Date(endDate);
  }
  
  const total = await Product.countDocuments(countQuery);

  // Get language from Accept-Language header
  const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const localizedProducts = getLocalizedResponse(products.map(p => p.toObject()), language);

  res.localizedJson(200, {
    status: 'success',
    message: 'products.date_range_retrieved',
    data: {
      products: localizedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        startDate,
        endDate,
        dateField
      }
    }
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getCategories,
  updateStock,
  restoreProduct,
  getAllProductsAdmin,
  getProductStats,
  getExpiredProducts,
  getNearExpiryProducts,
  getProductsByDateRange
};

/*
Test Cases:

1. Create product:
   POST /api/v1/products
   Headers: { "Authorization": "Bearer <token>" }
   Body: {
     "name": "iPhone 15",
     "description": "Latest iPhone model",
     "price": 999.99,
     "stock": 50,
     "sku": "IPH15-001",
     "category": "Electronics"
   }
   Expected: 201 Created

2. Get all products:
   GET /api/v1/products?page=1&limit=10&category=Electronics
   Expected: 200 OK, paginated products

3. Get product by ID:
   GET /api/v1/products/:id
   Expected: 200 OK, product details

4. Update product:
   PATCH /api/v1/products/:id
   Headers: { "Authorization": "Bearer <token>" }
   Body: { "price": 899.99, "stock": 45 }
   Expected: 200 OK, updated product

5. Search products:
   GET /api/v1/products/search?q=iPhone&minPrice=500&maxPrice=1500
   Expected: 200 OK, search results

6. Get categories:
   GET /api/v1/products/categories
   Expected: 200 OK, list of categories
*/