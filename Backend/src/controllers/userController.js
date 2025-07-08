import User from "../models/User.js"
import { validationResult } from "express-validator"
import { AppError } from "../utils/errorUtils.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private
export const getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, userType, search } = req.query

  // Build query
  const query = { isActive: true }

  if (userType) {
    query.userType = userType.toLowerCase()
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "businessInfo.companyName": { $regex: search, $options: "i" } },
    ]
  }

  // Execute query with pagination
  const users = await User.find(query)
    .select("-password -refreshToken")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })

  const total = await User.countDocuments(query)

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      pages: Math.ceil(total / limit),
    },
    data: users,
  })
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError("User not found", 404))
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()))
  }

  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    businessInfo: req.body.businessInfo,
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach((key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key])

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  })
})

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res, next) => {
  // Soft delete - set isActive to false
  await User.findByIdAndUpdate(req.user.id, { isActive: false })

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  })
})
