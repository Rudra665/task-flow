import { Inbox, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskCard } from "./TaskCard.jsx";

function EmptyGridState({ onCreate }) {
	return (
		<div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-color) bg-(--surface) px-6 py-16 text-center shadow-sm">
			<Inbox className="h-12 w-12 text-(--primary)" />
			<h3 className="mt-4 text-xl font-semibold text-(--page-fg)">
				No tasks found
			</h3>
			<p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
				Try another filter or create a new task to fill the board.
			</p>
			<button
				type="button"
				className="mt-6 rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
				onClick={onCreate}
			>
				Create task
			</button>
		</div>
	);
}

function TaskGrid({
	tasks,
	onCreate,
	onEdit,
	onDelete,
	onToggleStatus,
	onMoveTask,
}) {
	const [dragOverStatus, setDragOverStatus] = useState(null);

	const columns = useMemo(() => {
		return [
			{
				value: "pending",
				label: "Pending",
				tasks: tasks.filter((task) => task.status === "pending"),
			},
			{
				value: "completed",
				label: "Completed",
				tasks: tasks.filter((task) => task.status === "completed"),
			},
		];
	}, [tasks]);

	const handleDragStart = (event, task) => {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", task.id);
	};

	const handleDrop = (event, status) => {
		event.preventDefault();
		setDragOverStatus(null);
		const taskId = event.dataTransfer.getData("text/plain");
		const task = tasks.find((item) => item.id === taskId);
		if (!task || task.status === status) return;

		onMoveTask?.(task, status);
	};

	if (tasks.length === 0) {
		return <EmptyGridState onCreate={onCreate} />;
	}

	return (
		<div className="grid gap-5 xl:grid-cols-4">
			{columns.map((column) => (
				<div
					key={column.value}
					onDragOver={(event) => {
						event.preventDefault();
						setDragOverStatus(column.value);
					}}
					onDragLeave={() =>
						setDragOverStatus((current) =>
							current === column.value ? null : current,
						)
					}
					onDrop={(event) => handleDrop(event, column.value)}
					className={`rounded-3xl border border-(--border-color) bg-(--surface-2) p-4 transition-all duration-200 ease-out ${dragOverStatus === column.value ? "scale-[1.01] ring-2 ring-(--primary)" : ""}`}
				>
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--page-fg)">
								{column.label}
							</h3>
							<p className="mt-1 text-xs text-(--muted)">
								{column.tasks.length} tasks
							</p>
						</div>
						<button
							type="button"
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border-color) bg-(--surface) text-(--muted) transition hover:bg-(--surface-3) hover:text-(--page-fg)"
							onClick={onCreate}
							aria-label={`Add task to ${column.label}`}
						>
							<Plus className="h-4 w-4" />
						</button>
					</div>

					<div className="space-y-4">
						{column.tasks.length === 0 ? (
							<div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-(--border-color) bg-(--surface) px-4 py-8 text-center text-sm text-(--muted)">
								Drop task here
							</div>
						) : null}

						{column.tasks.map((task) => (
							<div
								key={task.id}
								draggable
								onDragStart={(event) =>
									handleDragStart(event, task)
								}
								onDragEnd={() => setDragOverStatus(null)}
								className="cursor-grab transition-transform duration-200 ease-out active:cursor-grabbing"
							>
								<TaskCard
									task={task}
									onEdit={onEdit}
									onDelete={onDelete}
									onToggleStatus={onToggleStatus}
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export { TaskGrid };
