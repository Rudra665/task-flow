import jwt from "jsonwebtoken";
import process from "node:process";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	createUser,
	findUserByEmail,
	findUserById,
	toPublicUser,
	verifyUserPassword,
} from "../services/dataService.js";

function createToken(user) {
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
	);
}

export const registerUser = asyncHandler(async (req, res) => {
	/**
	 * POST /api/auth/register
	 * Register a new user. Expects { name, email, password }.
	 * Validates input, ensures the email is not already registered, creates
	 * the persisted user via the data service, and returns a token + user.
	 */
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		throw new ApiError(400, "Name, email, and password are required");
	}

	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		throw new ApiError(409, "Email is already registered");
	}

	const user = await createUser({ name, email, password });
	const token = createToken(user);

	res.status(201).json({
		message: "Registration successful",
		token,
		user,
	});
});

export const loginUser = asyncHandler(async (req, res) => {
	/**
	 * POST /api/auth/login
	 * Authenticate a user. Expects { email, password }.
	 * Verifies credentials using the data service and returns a JWT token
	 * plus a public user object on success.
	 */
	const { email, password } = req.body;

	if (!email || !password) {
		throw new ApiError(400, "Email and password are required");
	}

	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(401, "Invalid email or password");
	}

	const passwordMatches = await verifyUserPassword(user, password);
	if (!passwordMatches) {
		throw new ApiError(401, "Invalid email or password");
	}

	const token = createToken(user);

	res.status(200).json({
		message: "Login successful",
		token,
		user: toPublicUser(user),
	});
});

export const getCurrentUser = asyncHandler(async (req, res) => {
	/**
	 * GET /api/auth/me
	 * Return the current authenticated user's public profile. Protected route;
	 * uses req.user populated by the auth middleware.
	 */
	const user = await findUserById(req.user.id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	res.status(200).json(toPublicUser(user));
});
