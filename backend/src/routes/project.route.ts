import { Router } from "express";

import {
    createProject,
    deleteProjectByIdandWorkspaceId,
    getAllProjectsInWorkspace,
    getProjectAnalytics,
    getProjectByIdandWorkspaceId,
    updateProjectByIdandWorkspaceId,
} from "../controllers/project.controller.js";
import taskRoutes from "./task.route.js";

// workspaceRoutes.use("/:workspaceId/projects", projectRoutes);
const projectRoutes = Router({ mergeParams: true });

projectRoutes.route("/").post(createProject).get(getAllProjectsInWorkspace);

projectRoutes
    .route("/:projectId")
    .get(getProjectByIdandWorkspaceId)
    .patch(updateProjectByIdandWorkspaceId)
    .delete(deleteProjectByIdandWorkspaceId);

projectRoutes.route("/:projectId/analytics").get(getProjectAnalytics);

// Task routes nested under a project
projectRoutes.use("/:projectId/tasks", taskRoutes);

export default projectRoutes;
