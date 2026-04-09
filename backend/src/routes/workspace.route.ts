import { Router } from "express";

import {
    createWorkspace,
    getAllWorkspacesUserIsMember,
    getWorkspaceAnalytics,
    getWorkspaceByIdwithMembers,
    getWorkspaceMembers,
} from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
workspaceRoutes.get("/:id", getWorkspaceByIdwithMembers);
workspaceRoutes.get("/members/:id", getWorkspaceMembers);
workspaceRoutes.get("/analytics/:id", getWorkspaceAnalytics);

// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.put(
//   "/change/member/role/:id",
//   changeWorkspaceMemberRoleController
// );

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

export default workspaceRoutes;
