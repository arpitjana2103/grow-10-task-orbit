import { Router } from "express";

import { createTask, updateTask } from "../controllers/task.controller.js";

// mergeParams: true — inherits :workspaceId and :projectId from parent routers
const taskRoutes = Router({ mergeParams: true });

taskRoutes.route("/").post(createTask);
taskRoutes.route("/:taskId").patch(updateTask);

export default taskRoutes;
