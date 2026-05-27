import { LoaderCircle } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.jsx";
import { TaskPage } from "./pages/TaskPage.jsx";
import { useTaskApp } from "./context/TaskContext.jsx";
import "./App.css";

function App() {
	const { user, isBootstrapping } = useTaskApp();

	if (isBootstrapping) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
				<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-violet-950/30 backdrop-blur">
					<LoaderCircle className="h-5 w-5 animate-spin text-violet-400" />
					<span className="text-sm font-medium tracking-wide">
						Loading Task Flow…
					</span>
				</div>
			</div>
		);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						user ? <Navigate to="/tasks" replace /> : <LoginPage />
					}
				/>
				<Route
					path="/tasks"
					element={user ? <TaskPage /> : <Navigate to="/" replace />}
				/>
				<Route
					path="*"
					element={<Navigate to={user ? "/tasks" : "/"} replace />}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
