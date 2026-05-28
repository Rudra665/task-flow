export const swaggerSpec = {
	openapi: "3.0.3",
	info: {
		title: "Task Flow API",
		version: "1.0.0",
		description: "JWT-authenticated task management API for Task Flow.",
	},
	servers: [{ url: "/api" }],
	tags: [
		{ name: "Auth", description: "Authentication routes" },
		{ name: "Users", description: "User directory routes" },
		{ name: "Tasks", description: "Protected task routes" },
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			User: {
				type: "object",
				properties: {
					id: { type: "string", example: "6654d5f14f9c2d7f9c12a001" },
					name: { type: "string", example: "Demo User" },
					email: { type: "string", example: "demo@taskflow.app" },
					role: { type: "string", example: "user" },
				},
			},
			AuthResponse: {
				type: "object",
				properties: {
					message: { type: "string", example: "Login successful" },
					token: { type: "string", example: "eyJhbGciOi..." },
					user: { $ref: "#/components/schemas/User" },
				},
			},
			UserListResponse: {
				type: "object",
				properties: {
					users: {
						type: "array",
						items: { $ref: "#/components/schemas/User" },
					},
				},
			},
			Task: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					description: { type: "string" },
					dueDate: { type: "string", format: "date-time" },
					status: { type: "string", enum: ["pending", "completed"] },
					owner: { type: "string" },
					assignee: {
						type: "object",
						nullable: true,
						properties: {
							id: { type: "string" },
							name: { type: "string" },
							email: { type: "string" },
						},
					},
					priority: {
						type: "string",
						enum: ["high", "medium", "low"],
					},
					board: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Error: {
				type: "object",
				properties: {
					message: {
						type: "string",
						example: "Something went wrong",
					},
				},
			},
		},
	},
	paths: {
		"/auth/register": {
			post: {
				tags: ["Auth"],
				summary: "Register a new user",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["name", "email", "password"],
								properties: {
									name: { type: "string" },
									email: { type: "string" },
									password: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					201: {
						description: "User created",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/AuthResponse",
								},
							},
						},
					},
				},
			},
		},
		"/auth/login": {
			post: {
				tags: ["Auth"],
				summary: "Login with email and password",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "password"],
								properties: {
									email: { type: "string" },
									password: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: "Authenticated",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/AuthResponse",
								},
							},
						},
					},
				},
			},
		},
		"/auth/me": {
			get: {
				tags: ["Auth"],
				summary: "Get authenticated user",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Current user",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/User" },
							},
						},
					},
				},
			},
		},
		"/users": {
			get: {
				tags: ["Users"],
				summary: "List users for task assignment",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "User list",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/UserListResponse",
								},
							},
						},
					},
				},
			},
		},
		"/auth/users": {
			get: {
				tags: ["Users"],
				summary: "List users via auth fallback",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "User list",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/UserListResponse",
								},
							},
						},
					},
				},
			},
		},
		"/tasks": {
			get: {
				tags: ["Tasks"],
				summary: "List tasks for the authenticated user",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Task list",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										tasks: {
											type: "array",
											items: {
												$ref: "#/components/schemas/Task",
											},
										},
									},
								},
							},
						},
					},
				},
			},
			post: {
				tags: ["Tasks"],
				summary: "Create a task",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["title", "description", "dueDate"],
								properties: {
									title: { type: "string" },
									description: { type: "string" },
									dueDate: {
										type: "string",
										format: "date-time",
									},
									status: {
										type: "string",
										enum: ["pending", "completed"],
									},
									priority: {
										type: "string",
										enum: ["high", "medium", "low"],
									},
									boardId: { type: "string" },
									assigneeId: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					201: {
						description: "Task created",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Task" },
							},
						},
					},
				},
			},
		},
		"/tasks/{id}": {
			get: {
				tags: ["Tasks"],
				summary: "Get a task by id",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					200: {
						description: "Task details",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Task" },
							},
						},
					},
				},
			},
			patch: {
				tags: ["Tasks"],
				summary: "Update a task",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									title: { type: "string" },
									description: { type: "string" },
									dueDate: {
										type: "string",
										format: "date-time",
									},
									status: {
										type: "string",
										enum: ["pending", "completed"],
									},
									priority: {
										type: "string",
										enum: ["high", "medium", "low"],
									},
									assigneeId: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: "Task updated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Task" },
							},
						},
					},
				},
			},
			delete: {
				tags: ["Tasks"],
				summary: "Delete a task",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					200: {
						description: "Task deleted",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
											example:
												"Task deleted successfully",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};
