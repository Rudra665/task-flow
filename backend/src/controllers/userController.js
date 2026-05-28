import { asyncHandler } from "../utils/asyncHandler.js";
import { listUsers } from "../services/dataService.js";

/**
 * GET /api/users
 * Return a list of all users. This is used by the frontend to populate
 * assignee pickers. The list is provided in a public-safe shape via the
 * data service `listUsers` function.
 */
export const getUsers = asyncHandler(async (_req, res) => {
	const users = await listUsers();
	res.status(200).json({ users });
});
