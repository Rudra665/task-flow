import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
	{
		variants: {
			variant: {
				default:
					"border-[var(--primary)]/30 bg-[var(--primary-soft)] text-[var(--primary)]",
				secondary:
					"border-[var(--border-color)] bg-[var(--surface-2)] text-[var(--muted)]",
				success:
					"border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
				warning:
					"border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
				destructive:
					"border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
			},
		},
		defaultVariants: {
			variant: "secondary",
		},
	},
);

function Badge({ className, variant, ...props }) {
	return (
		<span
			className={cn(badgeVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Badge };
