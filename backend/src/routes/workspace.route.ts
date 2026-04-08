import { Router } from "express";

import {
    createWorkspace,
    getAllWorkspacesUserIsMember,
    getWorkspaceByIdwithMembers,
} from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
workspaceRoutes.get("/:id", getWorkspaceByIdwithMembers);

// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.put(
//   "/change/member/role/:id",
//   changeWorkspaceMemberRoleController
// );

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

// workspaceRoutes.get("/members/:id", getWorkspaceMembersController);
// workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

export default workspaceRoutes;
