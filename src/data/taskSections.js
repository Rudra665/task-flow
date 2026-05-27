export const taskSections = [
	{ value: "backlog", label: "Backlog" },
	{ value: "todo", label: "To Do" },
	{ value: "in-progress", label: "In Progress" },
	{ value: "review", label: "Review" },
];

export function getTaskSectionLabel(section) {
	return (
		taskSections.find((item) => item.value === section)?.label ?? "Backlog"
	);
}
