import { Router } from "express";

import {
    changeWorkspaceMemberRole,
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

workspaceRoutes.put("/change/member/role/:id", changeWorkspaceMemberRole);

// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

export default workspaceRoutes;
