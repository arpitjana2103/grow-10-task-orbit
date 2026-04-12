import { Router } from "express";

import {
    createProject,
    getAllProjectsInWorkspace,
    getProjectByIdandWorkspaceId,
} from "../controllers/project.controller.js";
const projectRoutes = Router({ mergeParams: true });

// workspaceRoutes.use("/:workspaceId/projects", projectRoutes);
projectRoutes.route("/").post(createProject).get(getAllProjectsInWorkspace);
projectRoutes.route("/:projectId").get(getProjectByIdandWorkspaceId);

export default projectRoutes;

// projectRoutes.put(
//   "/:id/workspace/:workspaceId/update",
//   updateProjectController
// );

// projectRoutes.delete(
//   "/:id/workspace/:workspaceId/delete",
//   deleteProjectController
// );

// projectRoutes.get(
//   "/:id/workspace/:workspaceId/analytics",
//   getProjectAnalyticsController
// );
