import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { getDatabaseMode } from "../config/db.js";

const memoryState = {
	users: [],
	tasks: [],
};

const SHARED_BOARD_ID = "6a17f230353b560a212cc643";
let sharedBoardOwnershipMigrated = false;

async function ensureSharedBoardOwnership() {
	if (getDatabaseMode() === "mongo") {
		if (sharedBoardOwnershipMigrated) return;

		await Task.updateMany(
			{ board: { $exists: false } },
			{ $set: { board: SHARED_BOARD_ID } },
		);
		sharedBoardOwnershipMigrated = true;
		return;
	}

	if (memoryState.tasks.some((task) => task.board !== SHARED_BOARD_ID)) {
		memoryState.tasks = memoryState.tasks.map((task) => ({
			...task,
			board: SHARED_BOARD_ID,
		}));
	}
}

/**
 * Ensures all tasks have the shared board id set. In Mongo mode this will
 * migrate documents missing the `board` field. In memory mode it patches the
 * in-memory task list. This keeps the app working with a single shared board
 * identity used across the frontend and backend.
 */

function serializeUser(user) {
	if (!user) return null;

	return {
		id: user.id ?? user._id?.toString(),
		name: user.name,
		email: user.email,
		role: user.role ?? "user",
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

/**
 * Convert internal user documents (mongo or memory) into a public-safe shape
 * returned by the API and used by the frontend. Removes sensitive fields.
 */

function serializeTask(task) {
	if (!task) return null;

	const assignee = task.assignee ?? task.assigneeId ?? null;
	const resolvedAssignee =
		typeof assignee === "string"
			? (memoryState.users.find((user) => user.id === assignee) ??
				assignee)
			: assignee;
	const assigneeId =
		assignee?._id?.toString?.() ??
		assignee?.id ??
		assignee?.toString?.() ??
		null;
	const assigneeName = resolvedAssignee?.name ?? task.assigneeName ?? null;
	const assigneeEmail = assignee?.email ?? null;

	return {
		id: task.id ?? task._id?.toString(),
		title: task.title,
		description: task.description,
		dueDate: task.dueDate,
		status: task.status,
		priority: ["high", "medium", "low"].includes(task.priority)
			? task.priority
			: "medium",
		owner: task.owner ?? task.ownerId ?? task.owner?.toString(),
		board: task.board ?? task.boardId ?? SHARED_BOARD_ID,
		assignee: assignee
			? {
					id: assigneeId,
					name: assigneeName,
					email: assigneeEmail,
				}
			: null,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
	};
}

function normalizeMongoTask(doc) {
	/**
	 * Normalize a MongoDB Task document into the API response shape. Keeps the
	 * public contract consistent between memory and mongo storage modes.
	 */
	return serializeTask({
		id: doc._id.toString(),
		title: doc.title,
		description: doc.description,
		dueDate: doc.dueDate,
		status: doc.status,
		priority: doc.priority,
		owner: doc.owner.toString(),
		board: doc.board ?? SHARED_BOARD_ID,
		assignee: doc.assignee,
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	});
}

function normalizeMongoUser(doc) {
	return serializeUser({
		id: doc._id.toString(),
		name: doc.name,
		email: doc.email,
		role: doc.role,
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	});
}

async function createMemoryUser({ name, email, password }) {
	const now = new Date().toISOString();
	const user = {
		id: randomUUID(),
		name,
		email: email.toLowerCase(),
		password: await bcrypt.hash(password, 12),
		role: "user",
		createdAt: now,
		updatedAt: now,
	};

	memoryState.users.push(user);
	return serializeUser(user);
}

async function createMongoUser({ name, email, password }) {
	const user = await User.create({ name, email, password });
	return normalizeMongoUser(user);
}

export async function createUser(payload) {
	if (getDatabaseMode() === "mongo") {
		return createMongoUser(payload);
	}

	return createMemoryUser(payload);
}

export async function findUserByEmail(email) {
	if (getDatabaseMode() === "mongo") {
		const user = await User.findOne({ email }).select("+password");
		return user;
	}

	return (
		memoryState.users.find((user) => user.email === email.toLowerCase()) ??
		null
	);
}

export async function findUserById(id) {
	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return null;
		const user = await User.findById(id);
		return user;
	}

	return memoryState.users.find((user) => user.id === id) ?? null;
}

export async function verifyUserPassword(user, password) {
	if (!user) return false;

	if (getDatabaseMode() === "mongo") {
		return user.comparePassword(password);
	}

	return bcrypt.compare(password, user.password);
}

export function toPublicUser(user) {
	return serializeUser(user);
}

async function createMongoTask(ownerId, payload) {
	const boardId = payload.boardId ?? payload.board ?? SHARED_BOARD_ID;
	const normalizedPriority =
		typeof payload.priority === "string"
			? payload.priority.toLowerCase()
			: payload.priority;
	const status = payload.status === "completed" ? "completed" : "pending";

	const task = await Task.create({
		owner: ownerId,
		board: boardId,
		assignee: payload.assigneeId ?? ownerId,
		title: payload.title,
		description: payload.description,
		dueDate: payload.dueDate,
		status,
		priority: ["high", "medium", "low"].includes(normalizedPriority)
			? normalizedPriority
			: "medium",
	});

	await task.populate("assignee", "name email role");
	return normalizeMongoTask(task);
}

async function createMemoryTask(ownerId, payload) {
	const boardId = payload.boardId ?? payload.board ?? SHARED_BOARD_ID;
	const normalizedPriority =
		typeof payload.priority === "string"
			? payload.priority.toLowerCase()
			: payload.priority;
	const status = payload.status === "completed" ? "completed" : "pending";
	const now = new Date().toISOString();
	const task = {
		id: randomUUID(),
		owner: ownerId,
		board: boardId,
		assignee: payload.assigneeId ?? ownerId,
		title: payload.title,
		description: payload.description,
		dueDate: payload.dueDate,
		status,
		priority: ["high", "medium", "low"].includes(normalizedPriority)
			? normalizedPriority
			: "medium",
		createdAt: now,
		updatedAt: now,
	};

	memoryState.tasks.push(task);
	return serializeTask(task);
}

export async function createTask(ownerId, payload) {
	await ensureSharedBoardOwnership();

	if (getDatabaseMode() === "mongo") {
		return createMongoTask(ownerId, payload);
	}

	return createMemoryTask(ownerId, payload);
}

export async function listTasks(ownerId, board, status) {
	await ensureSharedBoardOwnership();

	if (getDatabaseMode() === "mongo") {
		const query = { board: board ?? SHARED_BOARD_ID };
		if (status && ["pending", "completed"].includes(status)) {
			query.status = status;
		}

		const tasks = await Task.find(query)
			.populate("assignee", "name email role")
			.sort({ createdAt: -1 });
		return tasks.map(normalizeMongoTask);
	}

	return memoryState.tasks
		.filter(
			(task) =>
				task.board === (board ?? SHARED_BOARD_ID) &&
				(!status || task.status === status),
		)
		.sort(
			(left, right) =>
				new Date(right.createdAt) - new Date(left.createdAt),
		)
		.map(serializeTask);
}

export async function findTaskById(ownerId, id) {
	await ensureSharedBoardOwnership();

	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return null;
		const task = await Task.findOne({
			_id: id,
			board: SHARED_BOARD_ID,
		});
		return task ? normalizeMongoTask(task) : null;
	}

	const task = memoryState.tasks.find(
		(item) => item.id === id && item.board === SHARED_BOARD_ID,
	);
	return task ? serializeTask(task) : null;
}

export async function listUsers() {
	if (getDatabaseMode() === "mongo") {
		const users = await User.find({}).sort({ name: 1 });
		return users.map(normalizeMongoUser);
	}

	return memoryState.users
		.map(serializeUser)
		.sort((left, right) => left.name.localeCompare(right.name));
}

export async function updateTask(ownerId, id, payload) {
	await ensureSharedBoardOwnership();
	const normalizedPriority =
		typeof payload.priority === "string"
			? payload.priority.toLowerCase()
			: payload.priority;
	const nextStatus = ["pending", "completed"].includes(payload.status)
		? payload.status
		: null;

	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return null;
		const task = await Task.findOne({
			_id: id,
			board: SHARED_BOARD_ID,
		});
		if (!task) return null;

		if (typeof payload.title === "string") task.title = payload.title;
		if (typeof payload.description === "string")
			task.description = payload.description;
		if (payload.dueDate) task.dueDate = payload.dueDate;
		if (nextStatus) task.status = nextStatus;
		if (["high", "medium", "low"].includes(normalizedPriority))
			task.priority = normalizedPriority;
		if (payload.assigneeId) task.assignee = payload.assigneeId;

		const updatedTask = await task.save();
		await updatedTask.populate("assignee", "name email role");
		return normalizeMongoTask(updatedTask);
	}

	const index = memoryState.tasks.findIndex(
		(item) => item.id === id && item.board === SHARED_BOARD_ID,
	);
	if (index === -1) return null;

	const current = memoryState.tasks[index];
	const nextTask = {
		...current,
		...(typeof payload.title === "string" ? { title: payload.title } : {}),
		...(typeof payload.description === "string"
			? { description: payload.description }
			: {}),
		...(payload.dueDate ? { dueDate: payload.dueDate } : {}),
		...(nextStatus ? { status: nextStatus } : {}),
		...(normalizedPriority &&
		["high", "medium", "low"].includes(normalizedPriority)
			? { priority: normalizedPriority }
			: {}),
		...(payload.assigneeId ? { assignee: payload.assigneeId } : {}),
		updatedAt: new Date().toISOString(),
	};

	memoryState.tasks[index] = nextTask;
	return serializeTask(nextTask);
}

export async function removeTask(ownerId, id) {
	await ensureSharedBoardOwnership();

	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return false;
		const result = await Task.findOneAndDelete({
			_id: id,
			board: SHARED_BOARD_ID,
		});
		return Boolean(result);
	}

	const before = memoryState.tasks.length;
	memoryState.tasks = memoryState.tasks.filter(
		(item) => !(item.id === id && item.board === SHARED_BOARD_ID),
	);
	return memoryState.tasks.length !== before;
}

/**
 * Normalize a MongoDB User document into the public user shape.
 */

/**
 * Create a new user in the in-memory store. Used when the app is running in
 * local mode for development or when MongoDB is unavailable.
 */

/**
 * Create a user in MongoDB and return the normalized public user.
 */

/**
 * Create a user. Chooses the appropriate storage implementation (mongo or
 * in-memory) based on environment configuration.
 */

/**
 * Find a user by email. Returns the raw user document (including password
 * in Mongo mode) so that authentication helpers can verify the password.
 */

/**
 * Find a user by id. Returns the user document or null if not found.
 */

/**
 * Verify a user's password. Supports both mongo documents (with the
 * `comparePassword` method) and local-memory hashed records.
 */

/**
 * Convert internal user shapes into a public-facing user object. This is the
 * canonical transformation used by controllers before sending JSON to clients.
 */
