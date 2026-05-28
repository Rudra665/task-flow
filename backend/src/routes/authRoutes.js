import express from "express";
import rateLimit from "express-rate-limit";
import {
	getCurrentUser,
	loginUser,
	registerUser,
} from "../controllers/authController.js";
import { getUsers } from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

// Authentication routes: registration, login and current-user lookup.
// Registration and login are rate-limited to mitigate brute-force attacks.
const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { message: "Too many auth attempts, please try again later." },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", protectRoute, getCurrentUser);
router.get("/users", protectRoute, getUsers);

export default router;
