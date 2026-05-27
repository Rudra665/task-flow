import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TaskDashboard } from "../components/dashboard/TaskDashboard.jsx";
import { useTaskApp } from "../context/TaskContext.jsx";

function TaskPage() {
	const navigate = useNavigate();
	const {
		user,
		users,
		tasks,
		filter,
		setFilter,
		logout,
		createTask,
		updateTask,
		deleteTask,
		toggleTaskStatus,
	} = useTaskApp();

	const taskCounts = useMemo(() => {
		const completed = tasks.filter(
			(task) => task.status === "completed",
		).length;
		const pending = tasks.filter(
			(task) => task.status === "pending",
		).length;

		return {
			all: tasks.length,
			completed,
			pending,
		};
	}, [tasks]);

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<TaskDashboard
			user={user}
			users={users}
			tasks={tasks}
			taskCounts={taskCounts}
			filter={filter}
			onFilterChange={setFilter}
			onLogout={handleLogout}
			onCreateTask={createTask}
			onUpdateTask={updateTask}
			onDeleteTask={deleteTask}
			onToggleTaskStatus={toggleTaskStatus}
		/>
	);
}

export { TaskPage };
