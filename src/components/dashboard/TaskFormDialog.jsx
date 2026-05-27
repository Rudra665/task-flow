import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button.jsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card.jsx";
import { Input } from "../ui/input.jsx";
import { Select } from "../ui/select.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { useTaskApp } from "../../context/TaskContext.jsx";
import { taskSections } from "../../data/taskSections.js";

const initialForm = {
	title: "",
	description: "",
	dueDate: "",
	status: "pending",
	section: "backlog",
};

function formatDateForInput(dateValue) {
	if (!dateValue) return "";

	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "";

	return date.toISOString().slice(0, 10);
}

function TaskFormDialog({
	open,
	task,
	users = [],
	currentUser,
	onClose,
	onSubmit,
}) {
	const { theme } = useTaskApp();
	const dueDateInputRef = useRef(null);
	const [values, setValues] = useState(() =>
		task
			? {
					title: task.title ?? "",
					description: task.description ?? "",
					dueDate: formatDateForInput(task.dueDate),
					status: task.status ?? "pending",
					section: task.section ?? "backlog",
					assigneeId:
						task.assigneeId ??
						task.assignee?.id ??
						currentUser?.id ??
						"",
				}
			: {
					...initialForm,
					assigneeId: currentUser?.id ?? initialForm.assigneeId,
				},
	);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isEditing = Boolean(task);
	const title = useMemo(
		() => (isEditing ? "Edit task" : "Create task"),
		[isEditing],
	);

	const handleChange = (field) => (event) => {
		setValues((current) => ({ ...current, [field]: event.target.value }));
		setErrors((current) => ({ ...current, [field]: "" }));
	};

	const validate = () => {
		const nextErrors = {};

		if (!values.title.trim()) {
			nextErrors.title = "Title is required.";
		} else if (values.title.trim().length < 3) {
			nextErrors.title = "Use at least 3 characters.";
		}

		if (!values.description.trim()) {
			nextErrors.description = "Description is required.";
		} else if (values.description.trim().length < 10) {
			nextErrors.description = "Add a bit more detail.";
		}

		if (!values.dueDate) {
			nextErrors.dueDate = "Due date is required.";
		}

		if (!taskSections.some((item) => item.value === values.section)) {
			nextErrors.section = "Choose a valid board section.";
		}

		if (!values.assigneeId) {
			nextErrors.assigneeId = "Assign the task to a user.";
		}

		if (!["pending", "completed"].includes(values.status)) {
			nextErrors.status = "Choose a valid status.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validate()) return;

		setIsSubmitting(true);
		try {
			await onSubmit({
				title: values.title.trim(),
				description: values.description.trim(),
				dueDate: values.dueDate,
				status: values.status,
				section: values.section,
				assigneeId: values.assigneeId,
			});
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	const isDark = theme === "dark";
	const fieldSurfaceClass = isDark
		? "border-(--border-color) bg-(--surface-2) text-(--page-fg)"
		: "border-(--border-color) bg-(--surface) text-(--page-fg)";
	const iconButtonClass = isDark
		? "border-(--border-color) bg-(--surface) text-(--muted) hover:bg-(--surface-3)"
		: "border-(--border-color) bg-(--surface-2) text-(--muted) hover:bg-(--surface-3)";
	const availableUsers = useMemo(() => {
		const combined = [
			...(currentUser ? [currentUser] : []),
			...(Array.isArray(users) ? users : []),
		];
		const unique = new Map();
		combined.forEach((user) => {
			if (user?.id) unique.set(user.id, user);
		});
		return [...unique.values()];
	}, [currentUser, users]);

	if (!open) return null;

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4 ${isDark ? "bg-slate-950/80" : "bg-slate-900/35"}`}
		>
			<div className="w-full max-w-2xl">
				<Card className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden border-(--border-color) bg-(--surface) shadow-2xl shadow-(color:--shadow-color) sm:max-h-[calc(100dvh-2rem)]">
					<CardHeader className="shrink-0 flex flex-row items-start justify-between gap-4 pb-4 sm:pb-4">
						<div>
							<CardTitle className="text-2xl text-(--page-fg)">
								{title}
							</CardTitle>
							<CardDescription className="text-(--muted)">
								Keep task details focused and easy to scan.
							</CardDescription>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onClose}
							aria-label="Close form"
						>
							<X className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="min-h-0 flex-1 overflow-y-auto">
						<form className="grid gap-4" onSubmit={handleSubmit}>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Task title
									</label>
									<Input
										placeholder="Launch onboarding flow"
										value={values.title}
										onChange={handleChange("title")}
									/>
									{errors.title ? (
										<p className="mt-2 text-sm text-rose-300">
											{errors.title}
										</p>
									) : null}
								</div>

								<div className="sm:col-span-2">
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Description
									</label>
									<Textarea
										className="text-(--page-fg)"
										placeholder="Describe the outcome, checklist, or context for this task."
										value={values.description}
										onChange={handleChange("description")}
									/>
									{errors.description ? (
										<p className="mt-2 text-sm text-rose-300">
											{errors.description}
										</p>
									) : null}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Due date
									</label>
									<div className="relative">
										<Input
											ref={dueDateInputRef}
											name="task-due-date"
											type="date"
											value={values.dueDate}
											onChange={handleChange("dueDate")}
											className={`pr-12 ${fieldSurfaceClass} appearance-none [color-scheme:inherit]`}
										/>
										<button
											type="button"
											className={`absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg border transition ${iconButtonClass}`}
											onClick={() => {
												dueDateInputRef.current?.showPicker?.();
												dueDateInputRef.current?.focus?.();
											}}
											aria-label="Open date picker"
										>
											<CalendarDays className="h-4 w-4" />
										</button>
									</div>
									{errors.dueDate ? (
										<p className="mt-2 text-sm text-rose-300">
											{errors.dueDate}
										</p>
									) : null}
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Status
									</label>
									<div className="relative">
										<Select
											value={values.status}
											onChange={handleChange("status")}
											className={`${fieldSurfaceClass} appearance-none pr-12`}
										>
											<option value="pending">
												Pending
											</option>
											<option value="completed">
												Completed
											</option>
										</Select>
										<div
											className={`pointer-events-none absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg border ${iconButtonClass}`}
										>
											<ChevronDown className="h-4 w-4" />
										</div>
									</div>
									{errors.status ? (
										<p className="mt-2 text-sm text-rose-300">
											{errors.status}
										</p>
									) : null}
								</div>

								<div className="sm:col-span-2">
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Assign to
									</label>
									<div className="relative">
										<Select
											value={values.assigneeId}
											onChange={handleChange(
												"assigneeId",
											)}
											className={`${fieldSurfaceClass} appearance-none pr-12`}
										>
											{availableUsers.map((userItem) => (
												<option
													key={userItem.id}
													value={userItem.id}
												>
													{userItem.name}
												</option>
											))}
										</Select>
										<div
											className={`pointer-events-none absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg border ${iconButtonClass}`}
										>
											<ChevronDown className="h-4 w-4" />
										</div>
									</div>
									{errors.assigneeId ? (
										<p className="mt-2 text-sm text-rose-300">
											{errors.assigneeId}
										</p>
									) : null}
								</div>
							</div>

							<div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting
										? "Saving…"
										: isEditing
											? "Update task"
											: "Create task"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export { TaskFormDialog };
