import { Router } from "express";

import {
    createProject,
    deleteProjectByIdandWorkspaceId,
    getAllProjectsInWorkspace,
    getProjectAnalytics,
    getProjectByIdandWorkspaceId,
    updateProjectByIdandWorkspaceId,
} from "../controllers/project.controller.js";
const projectRoutes = Router({ mergeParams: true });

// workspaceRoutes.use("/:workspaceId/projects", projectRoutes);
projectRoutes.route("/").post(createProject).get(getAllProjectsInWorkspace);

projectRoutes
    .route("/:projectId")
    .get(getProjectByIdandWorkspaceId)
    .patch(updateProjectByIdandWorkspaceId)
    .delete(deleteProjectByIdandWorkspaceId);

projectRoutes.route("/:projectId/analytics").get(getProjectAnalytics);

export default projectRoutes;
