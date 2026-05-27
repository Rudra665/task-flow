import { asyncHandler } from "../utils/asyncHandler.js";
import { listUsers } from "../services/dataService.js";

export const getUsers = asyncHandler(async (_req, res) => {
	const users = await listUsers();
	res.status(200).json({ users });
});
