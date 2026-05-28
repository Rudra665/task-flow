export const taskSections = [
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
];

export function getTaskSectionLabel(section) {
	return (
		taskSections.find((item) => item.value === section)?.label ?? "Pending"
	);
}
