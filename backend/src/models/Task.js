import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		board: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board",
			required: true,
			index: true,
		},
		assignee: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: [true, "Task title is required"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Task description is required"],
			trim: true,
		},
		dueDate: {
			type: Date,
			required: [true, "Task due date is required"],
		},
		status: {
			type: String,
			enum: ["pending", "completed"],
			default: "pending",
		},
		priority: {
			type: String,
			enum: ["high", "medium", "low"],
			default: "medium",
		},
	},
	{ timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
