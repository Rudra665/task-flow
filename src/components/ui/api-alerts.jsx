import { useMemo } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useTaskApp } from "../../context/TaskContext.jsx";
import { Button } from "./button.jsx";
import { Alert, AlertDescription, AlertTitle } from "./alert.jsx";

function ApiAlerts() {
	const { error, errorType, clearError } = useTaskApp();

	const message = useMemo(() => {
		if (!error) return "";
		return typeof error === "string" ? error : String(error);
	}, [error]);

	const isSuccess = errorType === "success";

	if (!message) return null;

	return (
		<div className="fixed left-1/2 top-4 z-[100] w-[min(720px,92vw)] -translate-x-1/2 px-2">
			<Alert variant={isSuccess ? "default" : "destructive"}>
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3 min-w-0">
						{isSuccess ? (
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
						) : (
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
						)}
						<div className="min-w-0">
							<AlertTitle
								className={
									isSuccess
										? "text-emerald-700 dark:text-emerald-300"
										: "text-rose-700 dark:text-rose-300"
								}
							>
								{isSuccess ? "Success" : "Error"}
							</AlertTitle>
							<AlertDescription
								className={
									isSuccess
										? "text-emerald-700 dark:text-emerald-300"
										: "text-rose-700 dark:text-rose-300"
								}
							>
								{message}
							</AlertDescription>
						</div>
					</div>
					<Button
						variant="outline"
						size="icon"
						className={`shrink-0 ${
							isSuccess
								? "border-emerald-400/30 text-emerald-700 dark:text-emerald-300"
								: "border-rose-400/30 text-rose-700 dark:text-rose-300"
						}`}
						onClick={clearError}
						aria-label="Dismiss"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</Alert>
		</div>
	);
}

export { ApiAlerts };
