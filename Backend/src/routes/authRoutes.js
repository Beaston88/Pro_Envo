import express from "express"
import { register, login, logout, getMe, refreshToken, updatePassword } from "../controllers/authController.js"
import { protect } from "../middleware/auth.js"
import { validateRegister, validateLogin, validatePasswordUpdate } from "../middleware/validation.js"

const router = express.Router()

// Public routes
router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.post("/refresh", refreshToken)

// Protected routes - Apply protect middleware to all routes below
router.use(protect)

router.post("/logout", logout)
router.get("/me", getMe)
router.put("/updatepassword", validatePasswordUpdate, updatePassword)

export default router