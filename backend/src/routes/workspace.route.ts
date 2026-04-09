import { Router } from "express";

import {
    createWorkspace,
    getAllWorkspacesUserIsMember,
    getWorkspaceByIdwithMembers,
    getWorkspaceMembers,
} from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
workspaceRoutes.get("/:id", getWorkspaceByIdwithMembers);
workspaceRoutes.get("/members/:id", getWorkspaceMembers);

// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.put(
//   "/change/member/role/:id",
//   changeWorkspaceMemberRoleController
// );

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);
// workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

export default workspaceRoutes;
