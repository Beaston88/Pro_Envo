import express from "express"
import { getUsers, getUser, updateProfile, deleteAccount } from "../controllers/userController.js"
import { protect, authorize, checkOwnership } from "../middleware/auth.js"
import { validateProfileUpdate } from "../middleware/validation.js"

const router = express.Router()

// All routes are protected
router.use(protect)

// User profile routes
router.put("/profile", validateProfileUpdate, updateProfile)
router.delete("/account", deleteAccount)

// Admin routes
router.get("/", authorize("admin"), getUsers)
router.get("/:id", checkOwnership, getUser)

export default router