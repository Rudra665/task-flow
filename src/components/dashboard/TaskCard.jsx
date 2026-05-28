import {
	CalendarDays,
	CheckCircle2,
	Circle,
	Pencil,
	Trash2,
} from "lucide-react";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { useTaskApp } from "../../context/TaskContext.jsx";

function formatDate(dateValue) {
	if (!dateValue) return "No due date";
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(dateValue));
}

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

function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
	const { theme } = useTaskApp();
	const statusTone = task.status === "completed" ? "success" : "warning";
	const priorityTone = getPriorityVariant(task.priority ?? "medium");
	const dark = theme === "dark";

	return (
		<Card
			className={`transition-all duration-200 ease-out hover:-translate-y-0.5 ${dark ? "border-(--border-color) bg-(--surface-2) hover:border-(--primary)/20 hover:bg-(--surface)" : "border-(--border-color) bg-(--surface) hover:border-(--primary)/20 hover:bg-(--surface-2)"}`}
		>
			<CardContent className="p-5">
				<div className="flex flex-col gap-4">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-lg font-semibold text-(--page-fg)">
									{task.title}
								</h3>
								<Badge variant={statusTone}>
									{task.status}
								</Badge>
								<Badge variant={priorityTone}>
									{formatPriority(task.priority)}
								</Badge>
								<Badge variant="secondary">
									{task.assigneeName ??
										task.assignee?.name ??
										"Unassigned"}
								</Badge>
							</div>
							<p className="mt-2 line-clamp-2 text-sm leading-6 text-(--muted)">
								{task.description}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-(--muted)">
						<div className="flex items-center gap-2">
							<CalendarDays className="h-4 w-4" />
							<span>{formatDate(task.dueDate)}</span>
						</div>
						<span>
							Updated{" "}
							{formatDate(task.updatedAt ?? task.createdAt)}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							size="sm"
							variant="secondary"
							onClick={() => onToggleStatus(task)}
						>
							{task.status === "completed" ? (
								<Circle className="h-4 w-4" />
							) : (
								<CheckCircle2 className="h-4 w-4" />
							)}
							Mark as{" "}
							{task.status === "completed"
								? "Pending"
								: "Completed"}
						</Button>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => onEdit(task)}
						>
							<Pencil className="h-4 w-4" /> Edit
						</Button>
						<Button
							type="button"
							size="sm"
							variant="destructive"
							onClick={() => onDelete(task)}
						>
							<Trash2 className="h-4 w-4" /> Delete
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export { TaskCard };
