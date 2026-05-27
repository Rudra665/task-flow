import express from "express";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasks,
	updateTask,
} from "../controllers/taskController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTaskById).patch(updateTask).delete(deleteTask);

export default router;
