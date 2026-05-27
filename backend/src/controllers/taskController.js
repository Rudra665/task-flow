import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	createTask as createTaskRecord,
	findUserById,
	findTaskById,
	listTasks,
	removeTask as removeTaskRecord,
	updateTask as updateTaskRecord,
} from "../services/dataService.js";

export const getTasks = asyncHandler(async (req, res) => {
	const tasks = await listTasks(req.user.id, req.query.status);

	res.status(200).json({ tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const task = await findTaskById(req.user.id, id);

	if (!task) {
		throw new ApiError(404, "Task not found");
	}

	res.status(200).json(task);
});

export const createTask = asyncHandler(async (req, res) => {
	const { title, description, dueDate, status, section, assigneeId } =
		req.body;

	if (!title || !description || !dueDate) {
		throw new ApiError(400, "Title, description, and dueDate are required");
	}

	const assignee = await findUserById(assigneeId || req.user.id);
	if (!assignee) {
		throw new ApiError(404, "Assignee not found");
	}

	const task = await createTaskRecord(req.user.id, {
		title,
		description,
		dueDate,
		status,
		section,
		assigneeId: assignee.id ?? assignee._id?.toString?.() ?? req.user.id,
	});

	res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
	const { id } = req.params;
	if (req.body.assigneeId || req.body.assignee) {
		const assignee = await findUserById(
			req.body.assigneeId || req.body.assignee,
		);
		if (!assignee) {
			throw new ApiError(404, "Assignee not found");
		}
	}
	const task = await updateTaskRecord(req.user.id, id, {
		...req.body,
		assigneeId: req.body.assigneeId || req.body.assignee,
	});

	if (!task) {
		throw new ApiError(404, "Task not found");
	}

	res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const deleted = await removeTaskRecord(req.user.id, id);

	if (!deleted) {
		throw new ApiError(404, "Task not found");
	}

	res.status(200).json({ message: "Task deleted successfully" });
});
