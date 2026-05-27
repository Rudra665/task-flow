import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthScreen } from "../components/auth/AuthScreen.jsx";
import { useTaskApp } from "../context/TaskContext.jsx";

function LoginPage() {
	const navigate = useNavigate();
	const { login, signup } = useTaskApp();
	const [mode, setMode] = useState("login");

	const handleSubmit = async (mode, values) => {
		if (mode === "signup") {
			await signup(values);
		} else {
			await login(values);
		}

		navigate("/tasks", { replace: true });
	};

	return (
		<AuthScreen
			mode={mode}
			onModeChange={setMode}
			onSubmit={handleSubmit}
		/>
	);
}

export { LoginPage };
