const Category = require('../models/Category');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
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
    
    return result;
  }
  
  return data;
};

// Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = req.query;

    // Check if this is a public route (limited fields)
    const isPublicRoute = req.route.path.includes('/public');

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Define fields to select based on route type
    let selectFields = '';
    if (isPublicRoute) {
      // For public routes, only return essential fields
      selectFields = '_id name description slug';
    }

    // Get categories with pagination
    let query = Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Apply field selection for public routes
    if (isPublicRoute) {
      query = query.select(selectFields);
    } else {
      // For admin/authenticated routes, populate additional fields
      query = query.populate('createdBy', 'name email');
    }
    
    const categories = await query.lean();

    // Get total count for pagination
    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    // Get language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    const localizedCategories = getLocalizedResponse(categories, language);

    res.status(200).json({
      success: true,
      message: req.t('categories.retrieved_successfully'),
      data: {
        categories: localizedCategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCategories,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if this is a public route (limited fields)
    const isPublicRoute = req.route.path.includes('/public');

    // Define fields to select based on route type
    let selectFields = '';
    if (isPublicRoute) {
      // For public routes, only return essential fields
      selectFields = '_id name description slug';
    }

    // Build query based on route type
    let query = Category.findById(id);
    
    if (isPublicRoute) {
      query = query.select(selectFields);
    } else {
      // For admin/authenticated routes, populate additional fields
      query = query.populate('createdBy', 'name email');
    }
    
    const category = await query.lean();

    if (!category) {
      return next(new AppError('categories.not_found', 404));
    }

    // Get language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    const localizedCategory = getLocalizedResponse(category, language);

    // Prepare response data
    let responseData = { category: localizedCategory };
    
    // Add product count only for non-public routes
    if (!isPublicRoute) {
      const productCount = await Product.countDocuments({
        category: id,
        isActive: true
      });
      responseData.category = {
        ...localizedCategory,
        productCount
      };
    }

    res.status(200).json({
      success: true,
      message: req.t('categories.retrieved_successfully'),
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, nameAr, description, descriptionAr, sortOrder } = req.body;

    // Transform data to new structure
    const categoryData = {
      name: {
        en: name,
        ar: nameAr
      },
      description: {
        en: description,
        ar: descriptionAr
      },
      sortOrder,
      createdBy: req.user.id
    };

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      $or: [
        { 'name.en': { $regex: `^${name}$`, $options: 'i' } },
        { 'name.ar': { $regex: `^${nameAr}$`, $options: 'i' } }
      ]
    });

    if (existingCategory) {
      return next(new AppError('categories.already_exists', 400));
    }

    const category = new Category(categoryData);
    await category.save();

    // Populate createdBy field
    await category.populate('createdBy', 'name email');

    // Get language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    const localizedCategory = getLocalizedResponse(category.toObject(), language);

    res.status(201).json({
      success: true,
      message: req.t('categories.created_successfully'),
      data: {
        category: localizedCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAr, description, descriptionAr, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('categories.not_found', 404));
    }

    // Check if new name conflicts with existing category
    if (name || nameAr) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [
          ...(name ? [{ name: { $regex: `^${name}$`, $options: 'i' } }] : []),
          ...(nameAr ? [{ nameAr: { $regex: `^${nameAr}$`, $options: 'i' } }] : [])
        ]
      });

      if (existingCategory) {
        return next(new AppError('categories.already_exists', 400));
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (nameAr !== undefined) category.nameAr = nameAr;
    if (description !== undefined) category.description = description;
    if (descriptionAr !== undefined) category.descriptionAr = descriptionAr;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // Populate createdBy field
    await category.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: req.t('categories.updated_successfully'),
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (soft delete)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('categories.not_found', 404));
    }

    // Check if category has active products
    const productCount = await Product.countDocuments({
      category: id,
      isActive: true
    });

    if (productCount > 0) {
      return next(new AppError('categories.has_active_products', 400));
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: req.t('categories.deleted_successfully'),
      data: {
        category: {
          _id: category._id,
          name: category.name,
          isActive: category.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Restore category
const restoreCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('categories.not_found', 404));
    }

    if (category.isActive) {
      return next(new AppError('categories.already_active', 400));
    }

    category.isActive = true;
    await category.save();

    await category.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: req.t('categories.restored_successfully'),
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get categories with product count
const getCategoriesWithStats = async (req, res, next) => {
  try {
    // Check if this is a public route (limited fields)
    const isPublicRoute = req.route.path.includes('/public');

    let categories;
    
    if (isPublicRoute) {
      // For public routes, use custom aggregation with limited fields
      categories = await Category.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $addFields: {
            productCount: {
              $size: {
                $filter: {
                  input: '$products',
                  cond: { $eq: ['$$this.isActive', true] }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            slug: 1,
            productCount: 1
          }
        },
        {
          $sort: { sortOrder: 1, name: 1 }
        }
      ]);
    } else {
      // For admin/authenticated routes, use the existing method
      categories = await Category.getCategoriesWithProductCount();
    }

    // Get language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    const localizedCategories = getLocalizedResponse(categories, language);

    res.status(200).json({
      success: true,
      message: req.t('categories.stats_retrieved_successfully'),
      data: {
        categories: localizedCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category statistics
const getCategoryStatistics = async (req, res, next) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const inactiveCategories = await Category.countDocuments({ isActive: false });

    // Get categories with most products
    const topCategories = await Category.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          nameAr: 1,
          productCount: 1
        }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get categories without products
    const emptyCategories = await Category.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $match: { productCount: 0 }
      },
      {
        $project: {
          name: 1,
          nameAr: 1
        }
      }
    ]);

    // Get language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    const localizedTopCategories = getLocalizedResponse(topCategories, language);
    const localizedEmptyCategories = getLocalizedResponse(emptyCategories, language);

    res.status(200).json({
      success: true,
      message: req.t('categories.statistics_retrieved_successfully'),
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        topCategories: localizedTopCategories,
        emptyCategories: emptyCategories.length,
        emptyCategoriesList: localizedEmptyCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update category sort order
const updateCategorySortOrder = async (req, res, next) => {
  try {
    const { categories } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(categories) || categories.length === 0) {
      return next(new AppError('categories.invalid_sort_data', 400));
    }

    // Update sort order for each category
    const updatePromises = categories.map(({ id, sortOrder }) => {
      return Category.findByIdAndUpdate(
        id,
        { sortOrder },
        { new: true, runValidators: true }
      );
    });

    const updatedCategories = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: req.t('categories.sort_order_updated_successfully'),
      data: {
        categories: updatedCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getCategoriesWithStats,
  getCategoryStatistics,
  updateCategorySortOrder
};