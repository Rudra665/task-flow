import { Button } from "../ui/button.jsx";

const filters = [
	{ value: "all", label: "All tasks" },
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
];

function TaskFilters({ filter, onChange, taskCounts }) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{filters.map((item) => {
				const active = filter === item.value;

				return (
					<Button
						key={item.value}
						type="button"
						variant={active ? "default" : "outline"}
						size="sm"
						onClick={() => onChange(item.value)}
					>
						{item.label}
						<span className="rounded-full bg-(--surface-2) px-2 py-0.5 text-[11px] font-semibold text-(--muted)">
							{taskCounts[item.value]}
						</span>
					</Button>
				);
			})}
		</div>
	);
}

export { TaskFilters };
