import { cn } from "../../lib/utils.js";

function Card({ className, ...props }) {
	return (
		<div
			className={cn(
				"rounded-3xl border border-(--border-color) bg-(--surface) shadow-2xl shadow-(color:--shadow-color) backdrop-blur-xl",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }) {
	return <div className={cn("p-6 pb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
	return (
		<h3
			className={cn("text-lg font-semibold text-(--page-fg)", className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }) {
	return (
		<p
			className={cn("mt-1 text-sm text-(--muted)", className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }) {
	return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
	return (
		<div
			className={cn("flex items-center p-6 pt-0", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
