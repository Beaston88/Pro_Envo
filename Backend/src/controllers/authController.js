import User from "../models/User.js"
import { validationResult } from "express-validator"
import { sendTokenResponse } from "../utils/tokenUtils.js"
import { AppError } from "../utils/errorUtils.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()))
  }

  const { name, email, password, userType, phone, businessInfo } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError("User already exists with this email", 400))
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    userType: userType.toLowerCase(),
    phone,
    businessInfo,
  })

  // Send token response
  sendTokenResponse(user, 201, res, "User registered successfully")
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()))
  }

  const { email, password, userType } = req.body

  // Check for user
  const user = await User.findOne({
    email: email.toLowerCase(),
    userType: userType.toLowerCase(),
    isActive: true,
  }).select("+password")

  if (!user) {
    return next(new AppError("Invalid credentials", 401))
  }

  // Check password
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401))
  }

  // Update last login
  await user.updateLastLogin()

  // Send token response
  sendTokenResponse(user, 200, res, "Login successful")
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.user.id, {
    $unset: { refreshToken: 1 },
  })

  // Clear cookies
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  res.cookie("refreshToken", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return next(new AppError("Refresh token not found", 401))
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + "refresh")
    const user = await User.findById(decoded.id).select("+refreshToken")

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError("Invalid refresh token", 401))
    }

    // Generate new tokens
    sendTokenResponse(user, 200, res, "Token refreshed successfully")
  } catch (error) {
    return next(new AppError("Invalid refresh token", 401))
  }
})

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()))
  }

  const user = await User.findById(req.user.id).select("+password")

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError("Current password is incorrect", 401))
  }

  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res, "Password updated successfully")
})
