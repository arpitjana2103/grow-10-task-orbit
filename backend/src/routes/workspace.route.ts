import { Router } from "express";

import { createWorkspace } from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace);
// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.put(
//   "/change/member/role/:id",
//   changeWorkspaceMemberRoleController
// );

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

// workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);

// workspaceRoutes.get("/members/:id", getWorkspaceMembersController);
// workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

// workspaceRoutes.get("/:id", getWorkspaceByIdController);

export default workspaceRoutes;
