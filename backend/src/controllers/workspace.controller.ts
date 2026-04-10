import type { RoleDocument } from "../models/role.model.js";
import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { PermissionEnum } from "../enums/role.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import WorkspaceModel from "../models/workspace.model.js";
import {
    ensureUserMembershipInWorkspaceService,
    getMembersInWorkspaceService,
} from "../services/member.service.js";
import { roleGuard } from "../services/role.service.js";
import {
    changeMemberRoleService,
    createWorkspaceService,
    getAllWorkspacesUserIsMemberService,
    getWorkspaceAnalyticsService,
} from "../services/workspace.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import { memberIdSchema } from "../validations/member.validations.js";
import {
    changeRoleSchema,
    createWorkspaceSchema,
    workspaceIdSchema,
} from "../validations/workspace.validations.js";

export const createWorkspace = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const body = createWorkspaceSchema.parse(req.body);
    const userId = req.user!._id.toString() as string;
    const newWorkspace = await createWorkspaceService(userId, {
        name: body.name,
        description: body.description,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspace: newWorkspace },
    });
});

export const getAllWorkspacesUserIsMember = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const userId = req.user!._id.toString() as string;
    const workspaces = await getAllWorkspacesUserIsMemberService(userId);

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspaces: workspaces },
    });
});

export const getWorkspaceByIdwithMembers = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = workspaceIdSchema.parse(req.params["workspaceId"]);
    const userId = req.user!._id.toString() as string;

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.VIEW_ONLY],
    });
    const members = await getMembersInWorkspaceService({ workspace });

    await workspace.populate({ path: "owner", select: "name email profilePicture" });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspace: { ...workspace.toObject(), members } },
    });
});

export const getWorkspaceMembers = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = workspaceIdSchema.parse(req.params["workspaceId"]);
    const userId = req.user!._id.toString() as string;

    const workspace = await WorkspaceModel.findById(workspaceId).select("name");

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.VIEW_ONLY],
    });
    const members = await getMembersInWorkspaceService({ workspace });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspace: { ...workspace.toObject(), members } },
    });
});

export const getWorkspaceAnalytics = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = workspaceIdSchema.parse(req.params["workspaceId"]);
    const userId = req.user!._id.toString() as string;

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.VIEW_ONLY],
    });

    const analytics = await getWorkspaceAnalyticsService(workspace);

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { analytics },
    });
});

export const changeWorkspaceMemberRole = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = workspaceIdSchema.parse(req.params["workspaceId"]);
    const memberId = memberIdSchema.parse(req.params["memberId"]);
    const userId = req.user!._id.toString() as string;
    const { roleName } = changeRoleSchema.parse(req.body);

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.CHANGE_MEMBER_ROLE],
    });

    const updatedMember = await changeMemberRoleService({ workspace, memberId, roleName });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { member: updatedMember },
    });
});
