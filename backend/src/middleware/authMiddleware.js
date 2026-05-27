import jwt from "jsonwebtoken";
import process from "node:process";
import { ApiError } from "../utils/ApiError.js";

export function protectRoute(req, _res, next) {
	const authHeader = req.headers.authorization || "";
	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		return next(new ApiError(401, "Not authorized, token missing"));
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role,
		};
		return next();
	} catch {
		return next(new ApiError(401, "Not authorized, token invalid"));
	}
}
