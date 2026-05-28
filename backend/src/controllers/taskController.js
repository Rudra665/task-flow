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

const SHARED_BOARD_ID = "6a17f230353b560a212cc643";

export const getTasks = asyncHandler(async (req, res) => {
	const boardId = req.query.boardId ?? req.query.board ?? SHARED_BOARD_ID;
	console.info("GET /api/tasks", {
		boardId,
		status: req.query.status ?? null,
	});
	const tasks = await listTasks(req.user.id, boardId, req.query.status);

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
	const {
		title,
		description,
		dueDate,
		status,
		priority,
		section,
		assigneeId,
	} = req.body;
	const boardId = req.body.boardId ?? req.body.board ?? SHARED_BOARD_ID;

	if (!title || !description || !dueDate) {
		throw new ApiError(400, "Title, description, and dueDate are required");
	}

	const assignee = await findUserById(assigneeId || req.user.id);
	if (!assignee) {
		throw new ApiError(404, "Assignee not found");
	}

	const task = await createTaskRecord(req.user.id, {
		boardId,
		title,
		description,
		dueDate,
		status,
		priority,
		section,
		assigneeId: assignee.id ?? assignee._id?.toString?.() ?? req.user.id,
	});

	res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const assigneeId =
		req.body.assigneeId ?? req.body.assignee?.id ?? req.body.assignee;
	if (assigneeId) {
		const assignee = await findUserById(assigneeId);
		if (!assignee) {
			throw new ApiError(404, "Assignee not found");
		}
	}
	const restBody = { ...req.body };
	delete restBody.assignee;
	const task = await updateTaskRecord(req.user.id, id, {
		...restBody,
		assigneeId,
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
