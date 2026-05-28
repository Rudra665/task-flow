import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
// import process from "node:process";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.set("etag", false);

app.use((req, res, next) => {
	res.setHeader(
		"Cache-Control",
		"no-store, no-cache, must-revalidate, proxy-revalidate",
	);
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");
	next();
});

app.use(helmet());
app.use(
	cors({
		origin: "*",
		credentials: true,
	}),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
	res.status(200).json({
		status: "ok",
		message: "Task Flow backend is running",
		docs: "/api-docs",
	});
});

app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, { explorer: true }),
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
