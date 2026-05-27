export const taskSections = ["backlog", "todo", "in-progress", "review"];

export function normalizeTaskSection(section) {
	return taskSections.includes(section) ? section : "backlog";
}
