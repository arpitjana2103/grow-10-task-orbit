import type { RoleDocument } from "../models/role.model.js";
import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { PermissionEnum } from "../enums/role.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import WorkspaceModel from "../models/workspace.model.js";
import { ensureUserMembershipInWorkspaceService } from "../services/member.service.js";
import {
    createProjectService,
    deleteProjectByIdAndWorkspaceService,
    getProjectAnalyticsService,
    getProjectByIdAndWorkspaceIdService,
    getProjectsInWorkspaceService,
    updateProjectByIdAndWorkspaceService,
} from "../services/project.service.js";
import { roleGuard } from "../services/role.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import {
    createProjectSchema,
    projectIdSchema,
    projectPaginationQuerySchema,
    updateProjectSchema,
} from "../validations/project.validations.js";
import { workspaceIdSchema } from "../validations/workspace.validations.js";

export const createProject = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, emoji, description } = createProjectSchema.parse(req.body);
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
        requiredPermissions: [PermissionEnum.CREATE_PROJECT],
    });

    const project = await createProjectService({
        userId: userId,
        workspaceId: workspaceId,
        body: { emoji, name, description },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { project },
    });
});

export const getAllProjectsInWorkspace = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
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

    const { pageSize, pageNumber } = await projectPaginationQuerySchema.parseAsync(req.query);
    const { projects, pagination } = await getProjectsInWorkspaceService({
        workspace,
        pageSize: pageSize,
        pageNumber: pageNumber,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: {
            projects,
            pagination,
        },
    });
});

export const getProjectByIdandWorkspaceId = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
    const projectId = await projectIdSchema.parseAsync(req.params["projectId"]);
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

    const project = await getProjectByIdAndWorkspaceIdService({ projectId, workspace });
    if (!project) {
        throw new AppError({
            publicMessage: `Project not found with id:${projectId} in workspace:${workspace._id.toString()}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: {
            project,
        },
    });
});

export const updateProjectByIdandWorkspaceId = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
    const projectId = await projectIdSchema.parseAsync(req.params["projectId"]);
    const { emoji, name, description } = await updateProjectSchema.parseAsync(req.body);
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
        requiredPermissions: [PermissionEnum.EDIT_PROJECT],
    });

    const updatedProject = await updateProjectByIdAndWorkspaceService({
        projectId,
        workspace,
        body: { emoji, name, description },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: {
            project: updatedProject,
        },
    });
});

export const deleteProjectByIdandWorkspaceId = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
    const projectId = await projectIdSchema.parseAsync(req.params["projectId"]);
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
        requiredPermissions: [PermissionEnum.DELETE_PROJECT],
    });

    await deleteProjectByIdAndWorkspaceService({ projectId, workspace });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "Project deleted successfully",
    });
});

export const getProjectAnalytics = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
    const projectId = await projectIdSchema.parseAsync(req.params["projectId"]);
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

    const analytics = await getProjectAnalyticsService({ workspace, projectId });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: {
            analytics,
        },
    });
});
