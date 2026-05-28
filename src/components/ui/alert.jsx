import { cn } from "../../lib/utils.js";

const alertVariants = {
	default: "border-(--border-color) bg-(--surface-2)",
	success: "border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/30",
	error: "border-rose-400/40    bg-rose-50    dark:bg-rose-950/30",
};

function Alert({ className, variant = "default", ...props }) {
	return (
		<div
			role="alert"
			className={cn(
				"relative w-full rounded-2xl border p-4",
				alertVariants[variant] ?? alertVariants.default,
				className,
			)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }) {
	return (
		<h5
			className={cn("mb-1 text-sm font-semibold", className)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }) {
	return (
		<div className={cn("text-sm text-(--muted)", className)} {...props} />
	);
}

export { Alert, AlertTitle, AlertDescription };
