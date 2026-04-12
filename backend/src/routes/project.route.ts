import { Router } from "express";

import { createProject } from "../controllers/project.controller.js";
const projectRoutes = Router({ mergeParams: true });

// workspaceRoutes.use("/:workspaceId/projects", projectRoutes);
projectRoutes.route("/").post(createProject);

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
//   "/workspace/:workspaceId/all",
//   getAllProjectsInWorkspaceController
// );

// projectRoutes.get(
//   "/:id/workspace/:workspaceId/analytics",
//   getProjectAnalyticsController
// );

// projectRoutes.get(
//   "/:id/workspace/:workspaceId",
//   getProjectByIdAndWorkspaceIdController
// );
