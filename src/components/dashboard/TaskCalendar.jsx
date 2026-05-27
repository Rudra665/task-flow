import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";

function toDayKey(date) {
	return date.toISOString().slice(0, 10);
}

function startOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
	return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(monthDate) {
	const firstDay = startOfMonth(monthDate);
	const startOffset = firstDay.getDay();
	const startDate = new Date(firstDay);
	startDate.setDate(firstDay.getDate() - startOffset);

	return Array.from({ length: 42 }, (_, index) => {
		const current = new Date(startDate);
		current.setDate(startDate.getDate() + index);
		return current;
	});
}

function shortenTaskTitle(title, maxLength = 14) {
	if (!title) return "Task";
	return title.length > maxLength
		? `${title.slice(0, maxLength).trimEnd()}…`
		: title;
}

function TaskCalendar({ tasks, onEdit }) {
	const [month, setMonth] = useState(() => startOfMonth(new Date()));
	const [chooserDay, setChooserDay] = useState(null);

	const taskMap = useMemo(() => {
		return tasks.reduce((map, task) => {
			if (!task.dueDate) return map;
			const key = toDayKey(new Date(task.dueDate));
			const items = map.get(key) ?? [];
			items.push(task);
			map.set(key, items);
			return map;
		}, new Map());
	}, [tasks]);

	const monthDays = useMemo(() => buildCalendarDays(month), [month]);

	const monthLabel = new Intl.DateTimeFormat("en", {
		month: "long",
		year: "numeric",
	}).format(month);

	const closeChooser = () => setChooserDay(null);

	const chooserTasks = chooserDay ? (taskMap.get(chooserDay) ?? []) : [];
	const chooserLabel = chooserDay
		? new Intl.DateTimeFormat("en", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}).format(new Date(chooserDay))
		: "";

	return (
		<>
			<Card className="border-(--border-color) bg-(--surface) shadow-sm">
				<CardContent className="p-4 sm:p-6">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
						<div>
							<div className="flex items-center gap-2 text-(--page-fg)">
								<CalendarDays className="h-4 w-4 text-(--primary) sm:h-5 sm:w-5" />
								<h3 className="text-base font-semibold sm:text-lg">
									Calendar
								</h3>
							</div>
							<p className="mt-1 text-xs text-(--muted) sm:text-sm">
								Track deadlines by due date.
							</p>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									setMonth((value) => addMonths(value, -1))
								}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="min-w-32 rounded-xl border border-(--border-color) bg-(--surface-2) px-3 py-2 text-center text-sm font-semibold text-(--page-fg) sm:min-w-40 sm:px-4">
								{monthLabel}
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									setMonth((value) => addMonths(value, 1))
								}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-7 gap-1 sm:gap-2">
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
							(day) => (
								<div
									key={day}
									className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-(--muted) sm:px-2 sm:text-xs sm:tracking-[0.18em]"
								>
									{day}
								</div>
							),
						)}
					</div>

					<div className="grid grid-cols-7 gap-1 sm:gap-2">
						{monthDays.map((day) => {
							const dayKey = toDayKey(day);
							const dayTasks = taskMap.get(dayKey) ?? [];
							const isCurrentMonth =
								day.getMonth() === month.getMonth();
							const isToday = dayKey === toDayKey(new Date());

							return (
								<div
									key={dayKey}
									className={`flex aspect-square min-h-0 flex-col overflow-hidden rounded-xl border p-1.5 sm:aspect-auto sm:min-h-36 sm:rounded-2xl sm:p-3 ${isCurrentMonth ? "border-(--border-color) bg-(--surface-2)" : "border-(--border-color) bg-(--surface) text-(--muted)"}`}
								>
									<div className="relative z-10 mb-1 flex items-center justify-between sm:mb-2">
										<span
											className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold sm:h-8 sm:w-8 sm:text-sm ${isToday ? "bg-(--primary) text-white" : "text-(--page-fg)"}`}
										>
											{day.getDate()}
										</span>
										<span className="hidden text-[11px] text-(--muted) sm:inline">
											{dayTasks.length} task
											{dayTasks.length === 1 ? "" : "s"}
										</span>
									</div>

									<div className="mt-auto">
										{dayTasks.length > 0 ? (
											<div className="relative z-0 flex flex-col gap-1 overflow-hidden">
												{dayTasks
													.slice(0, 1)
													.map((task) => (
														<button
															key={task.id}
															type="button"
															onClick={() => {
																if (
																	dayTasks.length >
																	1
																) {
																	setChooserDay(
																		dayKey,
																	);
																	return;
																}
																onEdit(task);
															}}
															className="group inline-flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-md border border-(--primary)/25 bg-(--surface) px-1.5 py-0.5 text-left text-[10px] font-medium text-(--page-fg) shadow-sm transition hover:border-(--primary)/45 hover:bg-(--surface-3) sm:px-2 sm:py-1 sm:text-xs"
															aria-label={
																dayTasks.length >
																1
																	? `View tasks for ${chooserLabel}`
																	: `Edit ${task.title}`
															}
														>
															<span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary) ring-2 ring-(--primary-soft)" />
															<span className="min-w-0 truncate">
																{shortenTaskTitle(
																	task.title,
																	11,
																)}
															</span>
														</button>
													))}
												{dayTasks.length > 1 ? (
													<button
														type="button"
														onClick={() =>
															setChooserDay(
																dayKey,
															)
														}
														className="text-left text-[10px] font-medium text-(--primary) sm:text-xs"
														aria-label={`View tasks for ${chooserLabel}`}
													>
														+{dayTasks.length - 1}{" "}
														more
													</button>
												) : null}
											</div>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{chooserDay ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-4 backdrop-blur-sm"
					onClick={closeChooser}
				>
					<div
						className="w-full max-w-sm rounded-3xl border border-(--border-color) bg-(--surface) p-4 shadow-2xl shadow-(color:--shadow-color)"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="mb-3 flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-(--page-fg)">
									Tasks on {chooserLabel}
								</p>
								<p className="text-xs text-(--muted)">
									Select a task to edit.
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={closeChooser}
							>
								<CalendarDays className="h-4 w-4" />
							</Button>
						</div>

						<div className="max-h-72 space-y-2 overflow-y-auto pr-1">
							{chooserTasks.map((task) => (
								<button
									key={task.id}
									type="button"
									onClick={() => {
										closeChooser();
										onEdit(task);
									}}
									className="flex w-full items-start gap-3 rounded-2xl border border-(--border-color) bg-(--surface-2) px-3 py-3 text-left transition hover:border-(--primary)/35 hover:bg-(--surface-3)"
								>
									<span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-(--primary) ring-4 ring-(--primary-soft)" />
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-semibold text-(--page-fg)">
											{task.title}
										</span>
										<span className="mt-1 block text-xs text-(--muted)">
											{task.status} ·{" "}
											{shortenTaskTitle(
												task.description,
												48,
											)}
										</span>
									</span>
								</button>
							))}
						</div>

						<div className="mt-4 flex justify-end">
							<Button variant="outline" onClick={closeChooser}>
								Close
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}

export { TaskCalendar };
