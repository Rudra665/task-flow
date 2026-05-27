import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { getDatabaseMode } from "../config/db.js";
import { normalizeTaskSection } from "../constants/taskSections.js";

const memoryState = {
	users: [],
	tasks: [],
};

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
		section: normalizeTaskSection(task.section),
		owner: task.owner ?? task.ownerId ?? task.owner?.toString(),
		assignee: assignee
			? {
					id: assigneeId,
					name: assigneeName,
					email: assigneeEmail,
				}
			: null,
		assigneeId,
		assigneeName,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
	};
}

function normalizeMongoTask(doc) {
	return serializeTask({
		id: doc._id.toString(),
		title: doc.title,
		description: doc.description,
		dueDate: doc.dueDate,
		status: doc.status,
		section: doc.section,
		owner: doc.owner.toString(),
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
	const task = await Task.create({
		owner: ownerId,
		assignee: payload.assigneeId ?? ownerId,
		title: payload.title,
		description: payload.description,
		dueDate: payload.dueDate,
		status: payload.status === "completed" ? "completed" : "pending",
		section: normalizeTaskSection(payload.section),
	});

	await task.populate("assignee", "name email role");
	return normalizeMongoTask(task);
}

async function createMemoryTask(ownerId, payload) {
	const now = new Date().toISOString();
	const task = {
		id: randomUUID(),
		owner: ownerId,
		assignee: payload.assigneeId ?? ownerId,
		title: payload.title,
		description: payload.description,
		dueDate: payload.dueDate,
		status: payload.status === "completed" ? "completed" : "pending",
		section: normalizeTaskSection(payload.section),
		createdAt: now,
		updatedAt: now,
	};

	memoryState.tasks.push(task);
	return serializeTask(task);
}

export async function createTask(ownerId, payload) {
	if (getDatabaseMode() === "mongo") {
		return createMongoTask(ownerId, payload);
	}

	return createMemoryTask(ownerId, payload);
}

export async function listTasks(ownerId, status) {
	if (getDatabaseMode() === "mongo") {
		const query = { owner: ownerId };
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
				task.owner === ownerId && (!status || task.status === status),
		)
		.sort(
			(left, right) =>
				new Date(right.createdAt) - new Date(left.createdAt),
		)
		.map(serializeTask);
}

export async function findTaskById(ownerId, id) {
	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return null;
		const task = await Task.findOne({ _id: id, owner: ownerId });
		return task ? normalizeMongoTask(task) : null;
	}

	const task = memoryState.tasks.find(
		(item) => item.id === id && item.owner === ownerId,
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
	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return null;
		const task = await Task.findOne({ _id: id, owner: ownerId });
		if (!task) return null;

		if (typeof payload.title === "string") task.title = payload.title;
		if (typeof payload.description === "string")
			task.description = payload.description;
		if (payload.dueDate) task.dueDate = payload.dueDate;
		if (["pending", "completed"].includes(payload.status))
			task.status = payload.status;
		if (payload.section)
			task.section = normalizeTaskSection(payload.section);
		if (payload.assigneeId) task.assignee = payload.assigneeId;

		const updatedTask = await task.save();
		await updatedTask.populate("assignee", "name email role");
		return normalizeMongoTask(updatedTask);
	}

	const index = memoryState.tasks.findIndex(
		(item) => item.id === id && item.owner === ownerId,
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
		...(payload.status && ["pending", "completed"].includes(payload.status)
			? { status: payload.status }
			: {}),
		...(payload.section
			? { section: normalizeTaskSection(payload.section) }
			: {}),
		...(payload.assigneeId ? { assignee: payload.assigneeId } : {}),
		updatedAt: new Date().toISOString(),
	};

	memoryState.tasks[index] = nextTask;
	return serializeTask(nextTask);
}

export async function removeTask(ownerId, id) {
	if (getDatabaseMode() === "mongo") {
		if (!mongoose.isValidObjectId(id)) return false;
		const result = await Task.findOneAndDelete({ _id: id, owner: ownerId });
		return Boolean(result);
	}

	const before = memoryState.tasks.length;
	memoryState.tasks = memoryState.tasks.filter(
		(item) => !(item.id === id && item.owner === ownerId),
	);
	return memoryState.tasks.length !== before;
}
