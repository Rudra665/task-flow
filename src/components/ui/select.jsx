import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const Select = forwardRef(({ className, children, ...props }, ref) => (
	<select
		ref={ref}
		className={cn(
			"flex h-11 w-full rounded-xl border border-(--border-color) bg-(--surface) px-4 py-2 text-sm text-(--page-fg) shadow-sm shadow-(color:--shadow-color) outline-none transition focus:border-(--primary)/50 focus:ring-2 focus:ring-(--primary)/20 disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	>
		{children}
	</select>
));

Select.displayName = "Select";

export { Select };
