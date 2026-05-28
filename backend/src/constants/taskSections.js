export const taskSections = ["pending", "completed"];

export function normalizeTaskSection(section) {
	return section === "completed" ? "completed" : "pending";
}
