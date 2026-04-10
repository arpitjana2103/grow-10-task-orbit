import { Router } from "express";

import {
    changeWorkspaceMemberRole,
    createWorkspace,
    getAllWorkspacesUserIsMember,
    getWorkspaceAnalytics,
    getWorkspaceByIdwithMembers,
    getWorkspaceMembers,
    joinWorksapceByInviteCode,
} from "../controllers/workspace.controller.js";

const workspaceRoutes = Router();

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
workspaceRoutes.route("/:workspaceId").get(getWorkspaceByIdwithMembers);
workspaceRoutes.route("/:workspaceId/analytics").get(getWorkspaceAnalytics);
workspaceRoutes.route("/:workspaceId/members").get(getWorkspaceMembers);
workspaceRoutes.route("/:workspaceId/members/:memberId/role").put(changeWorkspaceMemberRole);
workspaceRoutes.route("/invites/:inviteCode/join").post(joinWorksapceByInviteCode);

// workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

export default workspaceRoutes;
