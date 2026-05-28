import {
	CalendarDays,
	CheckCircle2,
	Circle,
	Inbox,
	Pencil,
	Trash2,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { DataTable } from "../ui/data-table.jsx";

function getPriorityVariant(priority) {
	switch (priority) {
		case "high":
			return "destructive";
		case "low":
			return "secondary";
		default:
			return "warning";
	}
}

function formatPriority(priority) {
	if (!priority) return "Medium";
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function EmptyState({ onCreate }) {
	return (
		<div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-color) bg-(--surface-2) px-6 py-16 text-center">
			<Inbox className="h-12 w-12 text-(--primary)" />
			<h3 className="mt-4 text-xl font-semibold text-(--page-fg)">
				No tasks found
			</h3>
			<p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
				Try a different filter or create your next task to get the board
				moving.
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

function TaskList({ tasks, onCreate, onEdit, onDelete, onToggleStatus }) {
	if (tasks.length === 0) {
		return <EmptyState onCreate={onCreate} />;
	}

	const columns = [
		{
			key: "task",
			header: "Task",
			headerClassName: "w-[48%]",
			cellClassName: "max-w-0 py-4",
			cell: (task) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-(--page-fg) sm:text-base">
						{task.title}
					</p>
					<p className="mt-1 line-clamp-2 text-sm leading-6 text-(--muted)">
						{task.description}
					</p>
				</div>
			),
		},
		{
			key: "dueDate",
			header: "Due date",
			headerClassName: "w-[22%]",
			cellClassName: "whitespace-nowrap text-sm text-(--muted)",
			cell: (task) => (
				<div className="flex items-center gap-2">
					<CalendarDays className="h-4 w-4 shrink-0" />
					<span>
						{task.dueDate
							? new Intl.DateTimeFormat("en", {
									month: "short",
									day: "numeric",
									year: "numeric",
								}).format(new Date(task.dueDate))
							: "No due date"}
					</span>
				</div>
			),
		},
		{
			key: "priority",
			header: "Priority",
			headerClassName: "w-[12%]",
			cell: (task) => (
				<Badge variant={getPriorityVariant(task.priority ?? "medium")}>
					{formatPriority(task.priority)}
				</Badge>
			),
		},
		{
			key: "assignee",
			header: "Assignee",
			headerClassName: "w-[18%]",
			cellClassName: "text-sm text-(--muted)",
			cell: (task) =>
				task.assigneeName ?? task.assignee?.name ?? "Unassigned",
		},
		{
			key: "status",
			header: "Status",
			headerClassName: "w-[12%]",
			cell: (task) => (
				<Badge
					variant={
						task.status === "completed" ? "success" : "warning"
					}
				>
					{task.status}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "Actions",
			headerClassName: "text-right",
			cellClassName: "text-right",
			cell: (task) => (
				<div className="flex items-center justify-end gap-2">
					<Button
						type="button"
						size="sm"
						variant="secondary"
						onClick={() => onToggleStatus(task)}
						aria-label={`Toggle ${task.title} status`}
					>
						{task.status === "completed" ? (
							<Circle className="h-4 w-4" />
						) : (
							<CheckCircle2 className="h-4 w-4" />
						)}
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => onEdit(task)}
						aria-label={`Edit ${task.title}`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						onClick={() => onDelete(task)}
						aria-label={`Delete ${task.title}`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={tasks}
			getRowKey={(task) => task.id}
		/>
	);
}

export { TaskList };
