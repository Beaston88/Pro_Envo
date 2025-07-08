import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { AppError } from "../utils/errorUtils.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new AppError("No user found with this token", 401))
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError("User account is deactivated", 401))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401))
  }
})

// Grant access to specific user types
export const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return next(new AppError(`User type ${req.user.userType} is not authorized to access this route`, 403))
    }
    next()
  }
}

// Check if user owns the resource or is admin
export const checkOwnership = asyncHandler(async (req, res, next) => {
  // If accessing own profile
  if (req.params.id === req.user.id.toString()) {
    return next()
  }

  // Add admin check here if needed
  return next(new AppError("Not authorized to access this resource", 403))
})
