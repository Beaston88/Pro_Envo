// Send token response with cookie
export const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.generateToken()
  const refreshToken = user.generateRefreshToken()

  // Save refresh token to database
  user.refreshToken = refreshToken
  user.save({ validateBeforeSave: false })

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }

  const refreshOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json({
      success: true,
      message,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    })
}
