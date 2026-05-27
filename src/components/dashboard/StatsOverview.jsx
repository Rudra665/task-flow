import { Badge } from "../ui/badge.jsx";
import { Card, CardContent } from "../ui/card.jsx";

function StatsOverview({ taskCounts }) {
	const completionRate =
		taskCounts.all > 0
			? Math.round((taskCounts.completed / taskCounts.all) * 100)
			: 0;

	const cards = [
		{ label: "All tasks", value: taskCounts.all, tone: "default" },
		{ label: "Completed", value: taskCounts.completed, tone: "success" },
		{ label: "Pending", value: taskCounts.pending, tone: "warning" },
		{ label: "Completion", value: `${completionRate}%`, tone: "secondary" },
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<Card
					key={card.label}
					className="border-(--border-color) bg-(--surface)"
				>
					<CardContent className="p-5">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm text-(--muted)">
									{card.label}
								</p>
								<p className="mt-2 text-3xl font-bold  tracking-tight text-(--muted)">
									{card.value}
								</p>
							</div>
							<Badge variant={card.tone}>{card.label}</Badge>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export { StatsOverview };
