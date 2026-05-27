import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const Input = forwardRef(({ className, type = "text", ...props }, ref) => (
	<input
		ref={ref}
		type={type}
		className={cn(
			"flex h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--page-fg)] shadow-sm shadow-[color:var(--shadow-color)] outline-none transition placeholder:text-[var(--muted-2)] focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));

Input.displayName = "Input";

export { Input };
