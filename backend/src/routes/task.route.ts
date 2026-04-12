import { Router } from "express";

import { createTask } from "../controllers/task.controller.js";

// mergeParams: true — inherits :workspaceId and :projectId from parent routers
const taskRoutes = Router({ mergeParams: true });

taskRoutes.route("/").post(createTask);

export default taskRoutes;
