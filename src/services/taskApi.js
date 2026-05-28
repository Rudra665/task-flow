import { demoTaskSeed, demoUserSeed } from "../data/mockTasks.js";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
const storageKeys = {
	session: "task-flow.session",
	user: "task-flow.active-user",
	token: "task-flow.auth-token",
	users: "task-flow.users",
	tasks: "task-flow.tasks",
};

const validPriorities = new Set(["high", "medium", "low"]);
const SHARED_BOARD_ID = "6a17f230353b560a212cc643";

const isBrowser = typeof window !== "undefined";
export const connectionMode = API_BASE_URL ? "backend" : "local";

function safeJsonParse(value, fallback) {
	try {
		return value ? JSON.parse(value) : fallback;
	} catch {
		return fallback;
	}
}

function readStorage(key, fallback) {
	if (!isBrowser) return fallback;
	return safeJsonParse(window.localStorage.getItem(key), fallback);
}

function writeStorage(key, value) {
	if (!isBrowser) return;
	window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key) {
	if (!isBrowser) return;
	window.localStorage.removeItem(key);
}

function readSession() {
	const storedSession = readStorage(storageKeys.session, null);
	if (storedSession && typeof storedSession === "object") {
		return storedSession;
	}

	const legacyUser = readStorage(storageKeys.user, null);
	if (legacyUser) {
		return {
			user: legacyUser,
			token: readStorage(storageKeys.token, ""),
		};
	}

	return null;
}

function ensureLocalUsers() {
	const storedUsers = readStorage(storageKeys.users, []);
	const hasDemoUser = storedUsers.some(
		(user) => user.email === demoUserSeed.email,
	);
	const nextUsers = hasDemoUser
		? storedUsers
		: [demoUserSeed, ...storedUsers];
	if (!hasDemoUser) {
		writeStorage(storageKeys.users, nextUsers);
	}
	return nextUsers;
}

function ensureLocalTasks() {
	const storedTasks = readStorage(storageKeys.tasks, []);
	if (storedTasks.length > 0) {
		const nextTasks = storedTasks.map((task) =>
			normalizeTask({
				...task,
				boardId: SHARED_BOARD_ID,
			}),
		);
		if (storedTasks.some((task) => task.boardId !== SHARED_BOARD_ID)) {
			persistTasks(nextTasks);
		}
		return nextTasks;
	}

	const nextTasks = demoTaskSeed.map((task) => normalizeTask(task));
	writeStorage(storageKeys.tasks, nextTasks);
	return nextTasks;
}

function persistUsers(users) {
	writeStorage(storageKeys.users, users);
}

function persistTasks(tasks) {
	writeStorage(storageKeys.tasks, tasks);
}

function persistSession(session) {
	if (session) {
		writeStorage(storageKeys.session, session);
		writeStorage(storageKeys.user, session.user);
		if (session.token) {
			writeStorage(storageKeys.token, session.token);
		} else {
			removeStorage(storageKeys.token);
		}
		return;
	}

	removeStorage(storageKeys.session);
	removeStorage(storageKeys.user);
	removeStorage(storageKeys.token);
}

function normalizeUser(user) {
	if (!user) return null;

	const sanitizedUser = { ...user };
	delete sanitizedUser.password;
	return sanitizedUser;
}

function normalizeTask(task) {
	const priority = validPriorities.has(task.priority)
		? task.priority
		: "medium";
	const assignee = task.assignee ?? null;

	return {
		id: task.id ?? crypto.randomUUID(),
		title: task.title.trim(),
		description: task.description.trim(),
		dueDate: task.dueDate,
		status: task.status === "completed" ? "completed" : "pending",
		priority,
		board: task.board ?? task.boardId ?? SHARED_BOARD_ID,
		boardId: task.boardId ?? task.board ?? SHARED_BOARD_ID,
		assignee,
		createdAt: task.createdAt ?? new Date().toISOString(),
		updatedAt: task.updatedAt ?? new Date().toISOString(),
	};
}

function getStoredToken() {
	return readSession()?.token ?? readStorage(storageKeys.token, "");
}

function apiHeaders(extraHeaders = { "Access-Control-Allow-Origin": "*" }) {
	const token = getStoredToken();

	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...extraHeaders,
	};
}

async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: apiHeaders(options.headers),
		...options,
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || "Request failed");
	}

	if (response.status === 204) return null;
	return response.json();
}

async function loginLocal({ email, password }) {
	const users = ensureLocalUsers();
	const user = users.find(
		(candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
	);

	if (!user || user.password !== password) {
		throw new Error("Invalid email or password.");
	}

	const sessionUser = normalizeUser(user);
	persistSession({
		user: sessionUser,
		token: `local-${crypto.randomUUID()}`,
	});
	return sessionUser;
}

async function signupLocal({ name, email, password }) {
	const users = ensureLocalUsers();
	const existingUser = users.find(
		(candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
	);

	if (existingUser) {
		throw new Error("An account with that email already exists.");
	}

	const createdUser = {
		id: crypto.randomUUID(),
		name,
		email,
		password,
	};

	const nextUsers = [...users, createdUser];
	persistUsers(nextUsers);

	const sessionUser = normalizeUser(createdUser);
	persistSession({
		user: sessionUser,
		token: `local-${crypto.randomUUID()}`,
	});
	return sessionUser;
}

async function fetchLocalTasks() {
	const tasks = ensureLocalTasks();
	return tasks.filter((task) => task.boardId === SHARED_BOARD_ID);
}

async function fetchLocalUsers() {
	const users = ensureLocalUsers();
	return users
		.map(normalizeUser)
		.sort((left, right) => left.name.localeCompare(right.name));
}

async function createLocalTask(userId, values) {
	const tasks = ensureLocalTasks();
	const createdTask = normalizeTask({
		...values,
		ownerId: userId,
		boardId: SHARED_BOARD_ID,
	});
	const nextTasks = [createdTask, ...tasks];
	persistTasks(nextTasks);
	return createdTask;
}

async function updateLocalTask(taskId, values) {
	const tasks = ensureLocalTasks();
	const nextTasks = tasks.map((task) => {
		if (task.id !== taskId) return task;

		return normalizeTask({
			...task,
			...values,
			updatedAt: new Date().toISOString(),
		});
	});

	persistTasks(nextTasks);
	return nextTasks.find((task) => task.id === taskId) ?? null;
}

async function deleteLocalTask(taskId) {
	const tasks = ensureLocalTasks();
	const nextTasks = tasks.filter((task) => task.id !== taskId);
	persistTasks(nextTasks);
}

export function getStoredSessionUser() {
	return normalizeUser(readSession()?.user ?? null);
}

export function getStoredSessionToken() {
	return readSession()?.token ?? readStorage(storageKeys.token, "");
}

export async function authenticate(mode, payload) {
	if (API_BASE_URL) {
		const path = mode === "signup" ? "/auth/register" : "/auth/login";
		const data = await apiRequest(path, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		const user = normalizeUser(data?.user ?? data);
		const token = data?.token ?? "";
		persistSession({ user, token });
		return user;
	}

	return mode === "signup" ? signupLocal(payload) : loginLocal(payload);
}

export async function getCurrentUser() {
	if (!API_BASE_URL) {
		return getStoredSessionUser();
	}

	const data = await apiRequest("/auth/me");
	return normalizeUser(data);
}

export async function getTasks(userId) {
	if (API_BASE_URL) {
		const data = await apiRequest(`/tasks`);
		const tasks = Array.isArray(data) ? data : (data?.tasks ?? []);
		return tasks.map(normalizeTask);
	}

	return fetchLocalTasks(userId);
}

export async function getUsers() {
	if (API_BASE_URL) {
		try {
			const data = await apiRequest("/users");
			const users = Array.isArray(data) ? data : (data?.users ?? []);
			return users
				.map(normalizeUser)
				.sort((left, right) => left.name.localeCompare(right.name));
		} catch (error) {
			const message = String(error?.message ?? "");
			if (
				message.includes("Route not found: /api/users") ||
				message.includes("Route not found: /api/auth/users")
			) {
				const data = await apiRequest("/auth/users");
				const users = Array.isArray(data) ? data : (data?.users ?? []);
				return users
					.map(normalizeUser)
					.sort((left, right) => left.name.localeCompare(right.name));
			}

			throw error;
		}
	}

	return fetchLocalUsers();
}

export async function addTask(userId, payload) {
	if (API_BASE_URL) {
		const normalizedPriority =
			typeof payload?.priority === "string"
				? payload.priority.toLowerCase()
				: payload?.priority;
		const requestPayload = {
			...payload,
			priority: validPriorities.has(normalizedPriority)
				? normalizedPriority
				: "medium",
			boardId: payload?.boardId ?? payload?.board ?? SHARED_BOARD_ID,
			board: payload?.board ?? payload?.boardId ?? SHARED_BOARD_ID,
			status: payload?.status === "completed" ? "completed" : "pending",
		};

		const data = await apiRequest("/tasks", {
			method: "POST",
			body: JSON.stringify(requestPayload),
		});

		return normalizeTask(data?.task ?? data);
	}

	return createLocalTask(userId, payload);
}

export async function editTask(taskId, payload) {
	if (API_BASE_URL) {
		const normalizedPriority =
			typeof payload?.priority === "string"
				? payload.priority.toLowerCase()
				: payload?.priority;
		const requestPayload = {
			...payload,
			status: payload?.status === "completed" ? "completed" : "pending",
			...(payload?.priority
				? {
						priority: validPriorities.has(normalizedPriority)
							? normalizedPriority
							: "medium",
					}
				: {}),
			...(payload?.board || payload?.boardId
				? {
						boardId:
							payload?.boardId ??
							payload?.board ??
							SHARED_BOARD_ID,
						board:
							payload?.board ??
							payload?.boardId ??
							SHARED_BOARD_ID,
					}
				: {}),
		};

		const data = await apiRequest(`/tasks/${taskId}`, {
			method: "PATCH",
			body: JSON.stringify(requestPayload),
		});

		return normalizeTask(data?.task ?? data);
	}

	return updateLocalTask(taskId, payload);
}

export async function removeTask(taskId) {
	const id =
		typeof taskId === "object" && taskId !== null ? taskId.id : taskId;
	if (!id) {
		throw new Error("A valid task id is required to delete a task.");
	}

	if (API_BASE_URL) {
		await apiRequest(`/tasks/${id}`, {
			method: "DELETE",
		});
		return;
	}

	await deleteLocalTask(id);
}

export function clearSession() {
	persistSession(null);
}

export function getConnectionMode() {
	return connectionMode;
}
