const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');

// Get all users with pagination and filtering
const getAllUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    role,
    isVerified,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (isVerified !== undefined) {
    filter.isVerified = isVerified === 'true';
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get users with pagination
  const users = await User.find(filter)
    .select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limitNum);

  res.localizedJson(200, {
    status: 'success',
    message: 'users.retrieved_successfully',
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

// Get user by ID
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires');

  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  res.localizedJson(200, {
    status: 'success',
    message: 'users.user_retrieved_successfully',
    data: {
      user
    }
  });
});

// Update user role
const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent admin from changing their own role
  if (id === req.user._id.toString()) {
    return next(new AppError('users.cannot_change_own_role', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Update user role
  user.role = role;
  await user.save();

  // Return updated user without sensitive fields
  const updatedUser = await User.findById(id)
    .select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires');

  res.localizedJson(200, {
    status: 'success',
    message: 'users.role_updated_successfully',
    data: {
      user: updatedUser
    }
  });
});

// Update user status (activate/deactivate)
const updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Prevent admin from deactivating themselves
  if (id === req.user._id.toString()) {
    return next(new AppError('users.cannot_change_own_status', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Update user status
  user.isActive = isActive;
  await user.save();

  // Return updated user without sensitive fields
  const updatedUser = await User.findById(id)
    .select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires');

  res.localizedJson(200, {
    status: 'success',
    message: isActive ? 'users.user_activated_successfully' : 'users.user_deactivated_successfully',
    data: {
      user: updatedUser
    }
  });
});

// Delete user (soft delete)
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    return next(new AppError('users.cannot_delete_own_account', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('auth.user_not_found', 404));
  }

  // Soft delete by setting isActive to false and adding deleted flag
  user.isActive = false;
  user.deletedAt = new Date();
  await user.save();

  res.localizedJson(200, {
    status: 'success',
    message: 'users.user_deleted_successfully'
  });
});

// Get user statistics
const getUserStatistics = catchAsync(async (req, res, next) => {
  // Get total users count
  const totalUsers = await User.countDocuments();
  
  // Get verified users count
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  
  // Get active users count
  const activeUsers = await User.countDocuments({ isActive: true });
  
  // Get users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get users registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Get users registered today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayUsers = await User.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow }
  });

  res.localizedJson(200, {
    status: 'success',
    message: 'users.statistics_retrieved_successfully',
    data: {
      statistics: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentUsers, // Last 30 days
        todayUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStatistics
};

/*
Controller Functions:

1. getAllUsers: Get paginated list of users with filtering
   - Supports filtering by role, verification status, search
   - Supports sorting and pagination
   - Returns user list with pagination info

2. getUserById: Get specific user details
   - Returns user without sensitive fields

3. updateUserRole: Change user role (user/admin)
   - Prevents admin from changing their own role
   - Updates role and returns updated user

4. updateUserStatus: Activate/deactivate user
   - Prevents admin from deactivating themselves
   - Updates isActive status

5. deleteUser: Soft delete user
   - Prevents admin from deleting themselves
   - Sets isActive to false and adds deletedAt timestamp

6. getUserStatistics: Get comprehensive user statistics
   - Total, verified, active users
   - Users by role breakdown
   - Recent registrations (30 days, today)
*/