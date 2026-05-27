export const demoUserSeed = {
	id: "demo-user",
	name: "Demo User",
	email: "demo@taskflow.app",
	password: "Password123!",
};

export const demoTaskSeed = [
	{
		id: "task-1",
		title: "Review project brief",
		description:
			"Read the feature list and confirm the next sprint priorities.",
		dueDate: "2026-05-29",
		status: "pending",
		section: "backlog",
		ownerId: demoUserSeed.id,
		assigneeId: demoUserSeed.id,
		assigneeName: demoUserSeed.name,
		createdAt: "2026-05-25T10:00:00.000Z",
		updatedAt: "2026-05-25T10:00:00.000Z",
	},
	{
		id: "task-2",
		title: "Prepare weekly demo",
		description:
			"Collect screenshots and notes for the stakeholder review.",
		dueDate: "2026-05-30",
		status: "completed",
		section: "review",
		ownerId: demoUserSeed.id,
		assigneeId: demoUserSeed.id,
		assigneeName: demoUserSeed.name,
		createdAt: "2026-05-24T14:30:00.000Z",
		updatedAt: "2026-05-26T09:15:00.000Z",
	},
	{
		id: "task-3",
		title: "Design mobile layout",
		description:
			"Refine the responsive task card layout for small screens.",
		dueDate: "2026-05-31",
		status: "pending",
		section: "in-progress",
		ownerId: demoUserSeed.id,
		assigneeId: demoUserSeed.id,
		assigneeName: demoUserSeed.name,
		createdAt: "2026-05-26T08:00:00.000Z",
		updatedAt: "2026-05-26T08:00:00.000Z",
	},
];
