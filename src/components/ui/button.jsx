import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
	{
		variants: {
			variant: {
				default:
					"bg-[var(--primary)] text-[var(--primary-contrast)] shadow-lg shadow-[color:var(--shadow-color)] hover:opacity-90",
				secondary:
					"border border-[var(--border-color)] bg-[var(--surface-2)] text-[var(--page-fg)] hover:bg-[var(--surface-3)]",
				outline:
					"border border-[var(--border-color)] bg-[var(--surface)] text-[var(--page-fg)] hover:bg-[var(--surface-2)]",
				ghost: "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--page-fg)]",
				destructive: "bg-rose-500 text-white hover:bg-rose-400",
			},
			size: {
				default: "h-11 px-4 py-2",
				sm: "h-9 rounded-lg px-3 text-xs",
				lg: "h-12 rounded-xl px-6 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const Button = forwardRef(
	({ className, variant, size, type = "button", ...props }, ref) => (
		<button
			ref={ref}
			type={type}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	),
);

Button.displayName = "Button";

export { Button };
