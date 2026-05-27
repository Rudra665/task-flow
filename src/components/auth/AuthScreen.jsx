import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Moon, ShieldCheck, Sun } from "lucide-react";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card.jsx";
import { Input } from "../ui/input.jsx";
import { useTaskApp } from "../../context/TaskContext.jsx";

const emptyForm = {
	name: "",
	email: "",
	password: "",
};

function AuthScreen({ mode, onModeChange, onSubmit }) {
	const { error, clearError, connectionMode, theme, toggleTheme } =
		useTaskApp();
	const [formValues, setFormValues] = useState(emptyForm);
	const [fieldErrors, setFieldErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const authCopy = useMemo(
		() => ({
			login: {
				title: "Welcome back",
				description: "Sign in to keep your task board moving.",
				button: "Sign in",
			},
			signup: {
				title: "Create your workspace",
				description:
					"Set up an account and start organizing tasks in minutes.",
				button: "Create account",
			},
		}),
		[],
	);

	const currentCopy = authCopy[mode];

	const updateField = (field) => (event) => {
		clearError();
		setFieldErrors((current) => ({ ...current, [field]: "" }));
		setFormValues((current) => ({
			...current,
			[field]: event.target.value,
		}));
	};

	const validate = () => {
		const nextErrors = {};

		if (mode === "signup" && !formValues.name.trim()) {
			nextErrors.name = "Name is required.";
		}

		if (!formValues.email.trim()) {
			nextErrors.email = "Email is required.";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
			nextErrors.email = "Enter a valid email address.";
		}

		if (!formValues.password) {
			nextErrors.password = "Password is required.";
		} else if (formValues.password.length < 6) {
			nextErrors.password = "Use at least 6 characters.";
		}

		setFieldErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validate()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(mode, formValues);
			setFormValues(emptyForm);
			setFieldErrors({});
		} catch {
			// Context already exposes the error message.
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 text-(--page-fg) sm:px-6 lg:px-8">
			<div className="fixed right-4 top-4 z-10">
				<Button variant="outline" size="icon" onClick={toggleTheme}>
					{theme === "dark" ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					)}
				</Button>
			</div>
			<div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
				<div className="relative overflow-hidden rounded-4xl border border-(--border-color) bg-(--surface) p-8 shadow-2xl shadow-(color:--shadow-color) backdrop-blur-xl sm:p-10">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_32%)]" />
					<div className="relative flex h-full flex-col justify-between gap-10">
						<div className="space-y-6">
							<Badge
								variant="default"
								className="w-fit gap-2 px-3 py-1.5 text-[21px] uppercase"
							>
								<img
									src="../src/assets/logo.png"
									alt="Task Flow"
									className="h-10 w-10"
								/>{" "}
								Task Flow
							</Badge>
							<div className="space-y-4">
								<h1 className="max-w-2xl text-4xl font-bold tracking-tight text-(--page-fg) sm:text-5xl">
									Plan, track, and ship your tasks without the
									chaos.
								</h1>
								<p className="max-w-xl text-base leading-7 text-(--muted) sm:text-lg">
									A responsive task management dashboard built
									with React, Tailwind, and shadcn-style
									components, complete with authentication,
									filtering, editing, and backend-ready API
									hooks.
								</p>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{[
								{
									icon: ShieldCheck,
									title: "Secure entry",
									copy: "Login and signup validation with reusable form controls.",
								},
								{
									icon: CheckCircle2,
									title: "Clear status view",
									copy: "Completed, pending, and all tasks in one responsive dashboard.",
								},
							].map(({ icon: Icon, title, copy }) => (
								<div
									key={title}
									className="rounded-2xl border border-(--border-color) bg-(--surface-2) p-4 backdrop-blur"
								>
									<Icon className="mb-3 h-5 w-5 text-(--primary)" />
									<h2 className="text-base font-semibold text-(--page-fg)">
										{title}
									</h2>
									<p className="mt-1 text-sm leading-6 text-(--muted)">
										{copy}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<Card className="self-center border-(--border-color) bg-(--surface)">
					<CardHeader>
						<CardTitle className="text-2xl text-(--page-fg)">
							{currentCopy.title}
						</CardTitle>
						<CardDescription className="text-(--muted)">
							{currentCopy.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex items-center justify-between rounded-2xl border border-(--border-color) bg-(--surface-2) p-1">
							<button
								type="button"
								className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-(--primary) text-(--page-fg) shadow-sm" : "text-(--muted) hover:text-(--page-fg)"}`}
								onClick={() => {
									clearError();
									onModeChange("login");
								}}
							>
								Login
							</button>
							<button
								type="button"
								className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${mode === "signup" ? "bg-(--primary) text-(--page-fg) shadow-sm" : "text-(--muted) hover:text-(--page-fg)"}`}
								onClick={() => {
									clearError();
									onModeChange("signup");
								}}
							>
								Signup
							</button>
						</div>

						<form className="space-y-4" onSubmit={handleSubmit}>
							{mode === "signup" ? (
								<div>
									<label className="mb-2 block text-sm font-medium text-(--page-fg)">
										Name
									</label>
									<Input
										placeholder="Jane Doe"
										value={formValues.name}
										onChange={updateField("name")}
									/>
									{fieldErrors.name ? (
										<p className="mt-2 text-sm text-rose-300">
											{fieldErrors.name}
										</p>
									) : null}
								</div>
							) : null}

							<div>
								<label className="mb-2 block text-sm font-medium text-(--page-fg)">
									Email
								</label>
								<Input
									type="email"
									placeholder="you@example.com"
									value={formValues.email}
									onChange={updateField("email")}
								/>
								{fieldErrors.email ? (
									<p className="mt-2 text-sm text-rose-300">
										{fieldErrors.email}
									</p>
								) : null}
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-(--page-fg)">
									Password
								</label>
								<Input
									type="password"
									placeholder="••••••••"
									value={formValues.password}
									onChange={updateField("password")}
								/>
								{fieldErrors.password ? (
									<p className="mt-2 text-sm text-rose-300">
										{fieldErrors.password}
									</p>
								) : null}
							</div>

							{error ? (
								<div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
									{error}
								</div>
							) : null}

							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Working…" : currentCopy.button}
								<ArrowRight className="h-4 w-4" />
							</Button>
						</form>

						<div className="rounded-2xl border border-dashed border-(--border-color) bg-(--surface-2) p-4 text-sm text-(--muted)">
							<p>
								Backend status:{" "}
								<span className="font-semibold text-(--primary)">
									{connectionMode}
								</span>
							</p>
							<p className="mt-1">
								Demo login:{" "}
								<span className="text-(--primary) font-medium">
									demo@taskflow.app
								</span>{" "}
								/{" "}
								<span className="text-(--primary) font-medium">
									Password123!
								</span>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export { AuthScreen };
