import {
	CalendarDays,
	LayoutGrid,
	Moon,
	List,
	LogOut,
	Menu,
	Plus,
	Search,
	Sun,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Select } from "../ui/select.jsx";
import { StatsOverview } from "./StatsOverview.jsx";
import { TaskCalendar } from "./TaskCalendar.jsx";
import { TaskFilters } from "./TaskFilters.jsx";
import { TaskFormDialog } from "./TaskFormDialog.jsx";
import { TaskGrid } from "./TaskGrid.jsx";
import { TaskList } from "./TaskList.jsx";
import { useTaskApp } from "../../context/TaskContext.jsx";

function TaskDashboard({
	user,
	users,
	tasks,
	taskCounts,
	filter,
	onFilterChange,
	onLogout,
	onCreateTask,
	onUpdateTask,
	onDeleteTask,
	onToggleTaskStatus,
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState(null);
	const [viewMode, setViewMode] = useState("grid");
	const [query, setQuery] = useState("");
	const [assigneeFilter, setAssigneeFilter] = useState("all");
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const { theme, toggleTheme } = useTaskApp();
	const assigneeOptions = useMemo(() => {
		const visibleUsers = Array.isArray(users) ? users : [];
		const currentUserOption = user
			? [{ id: user.id, name: user.name, email: user.email }]
			: [];
		const combined = [...currentUserOption, ...visibleUsers];
		const unique = new Map();
		combined.forEach((item) => {
			if (item?.id) unique.set(item.id, item);
		});
		return [...unique.values()].sort((left, right) =>
			left.name.localeCompare(right.name),
		);
	}, [user, users]);

	const displayedTasks = useMemo(() => {
		const filtered = tasks.filter((task) => {
			const taskStatus = (task.status ?? "").toLowerCase();
			if (filter !== "all" && taskStatus !== filter) {
				return false;
			}

			const taskAssigneeId =
				task.assigneeId ?? task.assignee?.id ?? task.ownerId;
			if (assigneeFilter !== "all" && taskAssigneeId !== assigneeFilter) {
				return false;
			}

			const searchText =
				`${task.title} ${task.description} ${task.status} ${task.priority ?? ""} ${task.assigneeName ?? task.assignee?.name ?? ""}`.toLowerCase();
			return searchText.includes(query.toLowerCase());
		});

		return filtered;
	}, [assigneeFilter, filter, query, tasks]);

	const openCreateDialog = () => {
		setEditingTask(null);
		setIsDialogOpen(true);
	};

	const openEditDialog = (task) => {
		setEditingTask(task);
		setIsDialogOpen(true);
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setEditingTask(null);
	};

	const closeMobileNav = () => setIsMobileNavOpen(false);

	const handleSubmit = async (taskValues, isEditing) => {
		if (isEditing && editingTask) {
			await onUpdateTask(editingTask.id, {
				...editingTask,
				...taskValues,
			});
			return;
		}

		await onCreateTask(taskValues);
	};
	const handleMoveTask = async (task, status) => {
		await onUpdateTask(task.id, {
			...task,
			status,
		});
	};

	return (
		<>
			{isMobileNavOpen ? (
				<div
					className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
					onClick={closeMobileNav}
				/>
			) : null}

			<div className="flex min-h-screen">
				<aside
					className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex-col overflow-y-auto border-r border-(--border-color) bg-(--surface) px-5 py-6 shadow-2xl shadow-(color:--shadow-color) transition-transform duration-200 lg:static lg:z-auto lg:flex lg:translate-x-0 ${isMobileNavOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:flex"}`}
				>
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--primary) text-white shadow-lg shadow-(color:--shadow-color)">
							<LayoutGrid className="h-5 w-5" />
						</div>
						<div>
							<p className="text-2xl font-bold tracking-tight text-(--page-fg)">
								Task Flow
							</p>
							<p className="text-sm text-(--muted)">
								Plan your next move
							</p>
						</div>
					</div>

					<div className="mt-4 flex items-center gap-3">
						<div
							className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary) text-sm font-semibold text-white shadow-lg shadow-(color:--shadow-color)"
							title={user.name}
							aria-label={`Profile ${user.name}`}
						>
							{user.name.slice(0, 1).toUpperCase()}
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={toggleTheme}
							aria-label="Toggle theme"
						>
							{theme === "dark" ? (
								<Sun className="h-4 w-4" />
							) : (
								<Moon className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={onLogout}
							aria-label="Logout"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>

					<nav className="mt-10 space-y-2">
						{[{ label: "Tasks", icon: List, active: true }].map(
							(item) => {
								const Icon = item.icon;
								return (
									<button
										key={item.label}
										type="button"
										className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${item.active ? "bg-(--surface-2) text-(--page-fg)" : "text-(--muted) hover:bg-(--surface-2) hover:text-(--page-fg)"}`}
									>
										<Icon className="h-4 w-4" />
										{item.label}
									</button>
								);
							},
						)}
					</nav>

					<div className="mt-8 rounded-[1.75rem] bg-(--surface-2) p-5 text-(--page-fg) shadow-xl shadow-(color:--shadow-color)">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-(--surface) text-lg font-semibold">
							?
						</div>
						<h3 className="text-lg font-semibold">Help Center</h3>
						<p className="mt-2 text-sm leading-6 text-(--muted)">
							Need a hand organizing tasks? Keep each task short,
							clear, and dated.
						</p>
						<Button
							className="mt-5 w-full"
							variant="outline"
							onClick={openCreateDialog}
						>
							Go to task composer
						</Button>
					</div>
				</aside>

				<main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
					<header className="mb-6 rounded-4xl border border-(--border-color) bg-(--surface) px-4 py-4 shadow-sm sm:px-6">
						<div className="flex items-center gap-3 lg:hidden">
							<button
								type="button"
								className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--border-color) bg-(--surface-2) text-(--page-fg) shadow-sm transition hover:bg-(--surface-3)"
								onClick={() =>
									setIsMobileNavOpen((current) => !current)
								}
								aria-label="Open menu"
								aria-expanded={isMobileNavOpen}
							>
								<Menu className="h-5 w-5" />
							</button>
							<div>
								<h1 className="text-2xl font-bold tracking-tight text-(--page-fg) sm:text-3xl">
									Explore Task
								</h1>
							</div>
						</div>

						<div className="hidden items-center justify-between gap-3 lg:flex">
							<div>
								<h1 className="text-2xl font-bold tracking-tight text-(--page-fg) sm:text-3xl">
									Explore Task
								</h1>
								<p className="mt-1 text-sm text-(--muted)">
									Track your work in list, grid, or calendar
									mode.
								</p>
							</div>

							<div className="flex items-center gap-3">
								<Button
									variant="outline"
									size="icon"
									onClick={toggleTheme}
								>
									{theme === "dark" ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)}
								</Button>
								<Button variant="outline" onClick={onLogout}>
									<LogOut className="h-4 w-4" /> Logout
								</Button>
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--primary) text-white shadow-lg shadow-(color:--shadow-color)">
									{user.name.slice(0, 1).toUpperCase()}
								</div>
							</div>
						</div>
					</header>

					<div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
						<div className="flex flex-wrap items-center gap-3">
							<TaskFilters
								filter={filter}
								onChange={onFilterChange}
								taskCounts={taskCounts}
							/>
						</div>

						<div className="grid grid-cols-5 gap-2 sm:grid-cols-[2fr_3fr_auto] sm:items-center">
							<Select
								value={assigneeFilter}
								className="col-span-2 w-full sm:col-span-1"
								onChange={(event) =>
									setAssigneeFilter(event.target.value)
								}
							>
								<option value="all">All users</option>
								{assigneeOptions.map((person) => (
									<option key={person.id} value={person.id}>
										{person.name}
									</option>
								))}
							</Select>
							<div className="col-span-3 flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--surface) px-3 py-2 text-sm text-(--muted) sm:col-span-1">
								<Search className="h-4 w-4 shrink-0" />
								<Input
									className="h-8 border-0 bg-transparent px-0 text-sm text-(--page-fg) shadow-none focus:ring-0"
									placeholder="Search Task"
									value={query}
									onChange={(event) =>
										setQuery(event.target.value)
									}
								/>
							</div>
							<Button
								onClick={openCreateDialog}
								className="col-span-5 w-full shrink-0 sm:col-span-1 sm:w-auto"
								variant="default"
							>
								<Plus className="h-4 w-4" /> Add task
							</Button>
						</div>
					</div>

					<StatsOverview taskCounts={taskCounts} />

					<div className="w-[92vw] mt-6 sm:w-full min-w-0 rounded-3xl border border-(--border-color) bg-(--surface) p-4 shadow-sm sm:p-6">
						<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-(--page-fg)">
									Task views
								</h2>
								<p className="mt-1 text-sm text-(--muted)">
									Switch between list, grid, and calendar
									layouts.
								</p>
							</div>
							<div className="inline-flex rounded-2xl border border-(--border-color) bg-(--surface-2) p-1">
								{[
									{
										id: "grid",
										label: "Grid",
										icon: LayoutGrid,
									},
									{ id: "list", label: "List", icon: List },
									{
										id: "calendar",
										label: "Calendar",
										icon: CalendarDays,
									},
								].map((item) => {
									const Icon = item.icon;
									const active = viewMode === item.id;
									return (
										<button
											key={item.id}
											type="button"
											className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-(--primary) text-white shadow-sm" : "text-(--muted) hover:text-(--page-fg)"}`}
											onClick={() => setViewMode(item.id)}
										>
											<Icon className="h-4 w-4" />
											{item.label}
										</button>
									);
								})}
							</div>
						</div>

						{viewMode === "grid" ? (
							<TaskGrid
								tasks={displayedTasks}
								onCreate={openCreateDialog}
								onEdit={openEditDialog}
								onDelete={onDeleteTask}
								onToggleStatus={onToggleTaskStatus}
								onMoveTask={handleMoveTask}
							/>
						) : viewMode === "calendar" ? (
							<TaskCalendar
								tasks={displayedTasks}
								onEdit={openEditDialog}
							/>
						) : (
							<TaskList
								tasks={displayedTasks}
								onCreate={openCreateDialog}
								onEdit={openEditDialog}
								onDelete={onDeleteTask}
								onToggleStatus={onToggleTaskStatus}
							/>
						)}
					</div>
				</main>
			</div>

			<TaskFormDialog
				key={`${editingTask?.id ?? "new"}-${isDialogOpen ? "open" : "closed"}`}
				open={isDialogOpen}
				task={editingTask}
				users={assigneeOptions}
				currentUser={user}
				onClose={closeDialog}
				onSubmit={handleSubmit}
			/>
		</>
	);
}

export { TaskDashboard };
