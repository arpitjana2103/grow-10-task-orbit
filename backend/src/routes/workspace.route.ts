import { Router } from "express";

import {
    changeWorkspaceMemberRole,
    createWorkspace,
    deleteWorkspace,
    getAllWorkspacesUserIsMember,
    getWorkspaceAnalytics,
    getWorkspaceByIdwithMembers,
    getWorkspaceMembers,
    joinWorksapceByInviteCode,
    updateWorkspace,
} from "../controllers/workspace.controller.js";
import projectRoutes from "./project.route.js";

const workspaceRoutes = Router();

// Project Routes
workspaceRoutes.use("/:workspaceId/projects", projectRoutes);

workspaceRoutes.route("/").post(createWorkspace).get(getAllWorkspacesUserIsMember);
workspaceRoutes
    .route("/:workspaceId")
    .get(getWorkspaceByIdwithMembers)
    .patch(updateWorkspace)
    .delete(deleteWorkspace);
workspaceRoutes.route("/:workspaceId/analytics").get(getWorkspaceAnalytics);
workspaceRoutes.route("/:workspaceId/members").get(getWorkspaceMembers);
workspaceRoutes.route("/:workspaceId/members/:memberId/role").put(changeWorkspaceMemberRole);
workspaceRoutes.route("/invites/:inviteCode/join").post(joinWorksapceByInviteCode);

export default workspaceRoutes;
