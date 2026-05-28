/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
	addTask,
	authenticate,
	clearSession,
	getConnectionMode,
	getCurrentUser,
	getUsers,
	getStoredSessionUser,
	getTasks,
	editTask,
	removeTask,
} from "../services/taskApi.js";

// TaskContext provides application-wide state for tasks, users, auth and
// UI preferences. It exposes helpers that the UI uses to mutate tasks in an
// optimistic fashion while persisting changes via the API client.
const TaskContext = createContext(null);
const initialStoredUser = getStoredSessionUser();
const initialConnectionMode = getConnectionMode();
const themeStorageKey = "task-flow.theme";

function getInitialTheme() {
	if (typeof window === "undefined") {
		return "light";
	}

	const storedTheme = window.localStorage.getItem(themeStorageKey);
	if (storedTheme === "light" || storedTheme === "dark") {
		return storedTheme;
	}

	return window.matchMedia?.("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

/**
 * TaskAppProvider
 * Wraps the app and provides task-related state and actions.
 * Exposed actions include login/signup/logout, create/edit/delete tasks,
 * toggle task status, and theme toggling. Handlers perform optimistic UI
 * updates and fall back to stored local data when the backend is not
 * available.
 */
export function TaskAppProvider({ children }) {
	const [user, setUser] = useState(() => initialStoredUser);
	const [tasks, setTasks] = useState([]);
	const [users, setUsers] = useState([]);
	const [filter, setFilter] = useState("all");
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [connectionMode] = useState(initialConnectionMode);
	const [error, setError] = useState("");
	const [theme, setTheme] = useState(getInitialTheme);

	useEffect(() => {
		if (typeof window === "undefined") return;

		window.localStorage.setItem(themeStorageKey, theme);
		document.documentElement.dataset.theme = theme;
		document.documentElement.style.colorScheme = theme;
	}, [theme]);

	useEffect(() => {
		let isActive = true;

		async function bootstrap() {
			try {
				if (initialConnectionMode === "backend") {
					try {
						const storedUser = initialStoredUser;
						const me = storedUser ? await getCurrentUser() : null;
						if (isActive && me) {
							setUser(me);
							setUsers(await getUsers());
							const nextTasks = await getTasks(me.id);
							setTasks(nextTasks);
						}
					} catch {
						clearSession();
						setUser(null);
						setUsers([]);
						setTasks([]);
					}
				} else if (initialStoredUser) {
					setUsers(await getUsers());
					const nextTasks = await getTasks(initialStoredUser.id);
					if (isActive) {
						setTasks(nextTasks);
					}
				}
			} finally {
				if (isActive) {
					setIsBootstrapping(false);
				}
			}
		}

		bootstrap();

		return () => {
			isActive = false;
		};
	}, []);

	// Authenticate (login or signup). Updates local session state and
	// refreshes the users and tasks lists after successful authentication.
	const handleAuthenticate = async (mode, payload) => {
		setError("");

		try {
			const authenticatedUser = await authenticate(mode, payload);
			setUser(authenticatedUser);
			setUsers(await getUsers());
			const nextTasks = await getTasks(authenticatedUser.id);
			setTasks(nextTasks);
			return authenticatedUser;
		} catch (authError) {
			setError(authError.message || "Unable to authenticate right now.");
			throw authError;
		}
	};

	// Clear session and reset client-side state.
	const handleLogout = () => {
		clearSession();
		setUser(null);
		setUsers([]);
		setTasks([]);
		setFilter("all");
	};

	// Toggle between light/dark themes and persist preference to localStorage.
	const handleToggleTheme = () => {
		setTheme((currentTheme) =>
			currentTheme === "dark" ? "light" : "dark",
		);
	};

	// Create a new task and optimistically add it to the UI. The server or
	// local store will return the authoritative task object which replaces
	// the optimistic entry when the request completes.
	const handleCreateTask = async (payload) => {
		if (!user) return null;

		const createdTask = await addTask(user.id, payload);
		setTasks((currentTasks) => [createdTask, ...currentTasks]);
		return createdTask;
	};

	// Update a task with optimistic UI. Reverts local state if the server
	// update fails.
	const handleUpdateTask = async (taskId, payload) => {
		const previousTasks = tasks;

		setTasks((currentTasks) =>
			currentTasks.map((task) =>
				task.id === taskId
					? {
							...task,
							...payload,
							updatedAt: new Date().toISOString(),
							status:
								payload.status === "completed"
									? "completed"
									: payload.status === "pending"
										? "pending"
										: task.status,
							priority: ["high", "medium", "low"].includes(
								payload.priority,
							)
								? payload.priority
								: task.priority,
						}
					: task,
			),
		);

		try {
			const updatedTask = await editTask(taskId, payload);
			setTasks((currentTasks) =>
				currentTasks.map((task) =>
					task.id === taskId ? updatedTask : task,
				),
			);
			return updatedTask;
		} catch (error) {
			setTasks(previousTasks);
			throw error;
		}
	};

	// Delete a task optimistically and revert on failure.
	const handleDeleteTask = async (taskId) => {
		const id =
			typeof taskId === "object" && taskId !== null ? taskId.id : taskId;
		if (!id) return;

		const previousTasks = tasks;
		setTasks((currentTasks) =>
			currentTasks.filter((task) => task.id !== id),
		);

		try {
			await removeTask(id);
		} catch (deleteError) {
			setTasks(previousTasks);
			throw deleteError;
		}
	};

	// Toggle task status (pending <-> completed) using the same update
	// pipeline so optimistic updates and server persistence are unified.
	const handleToggleTaskStatus = async (task) => {
		const nextStatus =
			task.status === "completed" ? "pending" : "completed";
		return handleUpdateTask(task.id, {
			...task,
			status: nextStatus,
		});
	};

	const value = {
		user,
		users,
		tasks,
		filter,
		setFilter,
		isBootstrapping,
		connectionMode,
		theme,
		setTheme,
		toggleTheme: handleToggleTheme,
		error,
		login: (payload) => handleAuthenticate("login", payload),
		signup: (payload) => handleAuthenticate("signup", payload),
		logout: handleLogout,
		createTask: handleCreateTask,
		updateTask: handleUpdateTask,
		deleteTask: handleDeleteTask,
		toggleTaskStatus: handleToggleTaskStatus,
		clearError: () => setError(""),
	};

	return (
		<TaskContext.Provider value={value}>{children}</TaskContext.Provider>
	);
}

export function useTaskApp() {
	const context = useContext(TaskContext);

	if (!context) {
		throw new Error("useTaskApp must be used within a TaskAppProvider.");
	}

	return context;
}
