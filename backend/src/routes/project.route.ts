import { Router } from "express";

import {
    createProject,
    getAllProjectsInWorkspace,
    getProjectAnalytics,
    getProjectByIdandWorkspaceId,
} from "../controllers/project.controller.js";
const projectRoutes = Router({ mergeParams: true });

// workspaceRoutes.use("/:workspaceId/projects", projectRoutes);
projectRoutes.route("/").post(createProject).get(getAllProjectsInWorkspace);
projectRoutes.route("/:projectId").get(getProjectByIdandWorkspaceId);
projectRoutes.route("/:projectId/analytics").get(getProjectAnalytics);

export default projectRoutes;

// projectRoutes.put(
//   "/:id/workspace/:workspaceId/update",
//   updateProjectController
// );

// projectRoutes.delete(
//   "/:id/workspace/:workspaceId/delete",
//   deleteProjectController
// );
