import express from "express";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasks,
	updateTask,
} from "../controllers/taskController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

// Routes for task management. All task routes are protected by the
// `protectRoute` middleware and operate against the shared board by
// default. Controller functions are defined in `controllers/taskController.js`.
const router = express.Router();

router.use(protectRoute);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTaskById).patch(updateTask).delete(deleteTask);

export default router;
