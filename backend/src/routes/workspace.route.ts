import { Router } from "express";

import {
    createWorkspace,
    getAllWorkspacesUserIsMember,
} from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.put(
//   "/change/member/role/:id",
//   changeWorkspaceMemberRoleController
// );

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

// workspaceRoutes.get("/all", getAllWorkspacesUserIsMember);

// workspaceRoutes.get("/members/:id", getWorkspaceMembersController);
// workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

// workspaceRoutes.get("/:id", getWorkspaceByIdController);

export default workspaceRoutes;
