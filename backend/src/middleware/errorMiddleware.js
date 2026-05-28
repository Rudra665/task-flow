import mongoose from "mongoose";
import process from "node:process";
import { ApiError } from "../utils/ApiError.js";

export function notFound(req, _res, next) {
	// Convert unmatched routes into a consistent API error response.
	next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, next) {
	/**
	 * Centralized error handler. Normalizes Mongoose validation and cast
	 * errors into friendly HTTP status codes and messages. Also hides stack
	 * traces in production. Always returns JSON { message, stack? }.
	 */
	void next;
	let statusCode = err.statusCode || 500;
	let message = err.message || "Internal Server Error";

	if (err instanceof mongoose.Error.CastError) {
		statusCode = 404;
		message = "Resource not found";
	}

	if (err.code === 11000) {
		statusCode = 409;
		const field = Object.keys(err.keyValue ?? {})[0] || "Field";
		message = `${field} already exists`;
	}

	if (err instanceof mongoose.Error.ValidationError) {
		statusCode = 400;
		message = Object.values(err.errors)
			.map((item) => item.message)
			.join(", ");
	}

	res.status(statusCode).json({
		message,
		stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
	});
}
