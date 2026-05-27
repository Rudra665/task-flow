import { cn } from "../../lib/utils.js";

function Table({ className, ...props }) {
	return (
		<div className="relative w-full overflow-auto">
			<table
				className={cn("w-full caption-bottom text-sm", className)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }) {
	return (
		<thead
			className={cn("[&_tr]:border-b border-(--border-color)", className)}
			{...props}
		/>
	);
}

function TableBody({ className, ...props }) {
	return (
		<tbody
			className={cn("[&_tr:last-child]:border-0", className)}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }) {
	return (
		<tfoot
			className={cn(
				"border-t bg-(--surface-2) font-medium [&>tr]:last:border-b-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableRow({ className, ...props }) {
	return (
		<tr
			className={cn(
				"border-b border-(--border-color) transition-colors hover:bg-(--surface-2)/60 data-[state=selected]:bg-(--surface-2)",
				className,
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }) {
	return (
		<th
			className={cn(
				"h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.16em] text-(--muted) [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }) {
	return (
		<td
			className={cn(
				"px-4 py-4 align-middle [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCaption({ className, ...props }) {
	return (
		<caption
			className={cn("mt-4 text-sm text-(--muted)", className)}
			{...props}
		/>
	);
}

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
