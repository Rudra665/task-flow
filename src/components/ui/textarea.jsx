import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const Textarea = forwardRef(({ className, ...props }, ref) => (
	<textarea
		ref={ref}
		className={cn(
			"flex min-h-30 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-sm shadow-black/10 outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));

Textarea.displayName = "Textarea";

export { Textarea };
