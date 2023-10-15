const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English category name is required'],
      trim: true,
      maxlength: [50, 'English category name cannot exceed 50 characters'],
      minlength: [2, 'English category name must be at least 2 characters']
    },
    ar: {
      type: String,
      required: [true, 'Arabic category name is required'],
      trim: true,
      maxlength: [50, 'Arabic category name cannot exceed 50 characters'],
      minlength: [2, 'Arabic category name must be at least 2 characters']
    }
  },
  description: {
    en: {
      type: String,
      trim: true,
      maxlength: [500, 'English description cannot exceed 500 characters']
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [500, 'Arabic description cannot exceed 500 characters']
    }
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
categorySchema.index({ 'name.en': 1 });
categorySchema.index({ 'name.ar': 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ 
  'name.en': 'text', 
  'name.ar': 'text', 
  'description.en': 'text', 
  'description.ar': 'text' 
});

// Virtual for getting localized name based on language
categorySchema.virtual('localizedName').get(function() {
  return this.nameAr || this.name;
});

// Virtual for getting localized description based on language
categorySchema.virtual('localizedDescription').get(function() {
  return this.descriptionAr || this.description;
});

// Instance method to generate slug from English name
categorySchema.methods.generateSlug = function() {
  const sourceName = this.name.en || this.name.ar || 'category';
  this.slug = sourceName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return this.slug;
};

// Static method to find active categories
categorySchema.statics.findActive = function(sortBy = 'sortOrder') {
  return this.find({ isActive: true }).sort({ [sortBy]: 1 });
};

// Static method to get categories with product count
categorySchema.statics.getCategoriesWithProductCount = async function() {
  return this.aggregate([
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
        products: 0
      }
    },
    {
      $sort: { sortOrder: 1, name: 1 }
    }
  ]);
};

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.generateSlug();
  }
  next();
});

// Pre-save middleware to ensure unique slug
categorySchema.pre('save', async function(next) {
  if (this.isModified('slug') || this.isNew) {
    const existingCategory = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      const timestamp = Date.now().toString().slice(-4);
      this.slug = `${this.slug}-${timestamp}`;
    }
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

/*
Test Cases:

1. Create Category:
{
  "name": "Electronics",
  "nameAr": "إلكترونيات",
  "description": "Electronic devices and gadgets",
  "descriptionAr": "الأجهزة الإلكترونية والأدوات"
}

2. Update Category:
{
  "name": "Home Electronics",
  "description": "Home electronic devices"
}

3. Get Categories with Product Count:
GET /api/v1/categories/stats

4. Search Categories:
GET /api/v1/categories?search=electronics&isActive=true
*/