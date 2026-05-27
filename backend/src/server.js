import "dotenv/config";
import process from "node:process";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const PORT = process.env.PORT || 4000;

async function startServer() {
	try {
		await connectDatabase();
		app.listen(PORT, () => {
			console.log(
				`Task Flow backend running on http://localhost:${PORT}`,
			);
			console.log(
				`Swagger docs available at http://localhost:${PORT}/api-docs`,
			);
		});
	} catch (error) {
		console.error("Failed to start backend:", error.message);
		process.exit(1);
	}
}

startServer();
