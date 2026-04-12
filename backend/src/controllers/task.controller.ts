import type { RoleDocument } from "../models/role.model.js";
import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { PermissionEnum } from "../enums/role.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import WorkspaceModel from "../models/workspace.model.js";
import { ensureUserMembershipInWorkspaceService } from "../services/member.service.js";
import { getProjectByIdAndWorkspaceIdService } from "../services/project.service.js";
import { roleGuard } from "../services/role.service.js";
import { createTaskService } from "../services/task.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import { projectIdSchema } from "../validations/project.validations.js";
import { createTaskSchema } from "../validations/task.validations.js";
import { workspaceIdSchema } from "../validations/workspace.validations.js";

export const createTask = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const body = await createTaskSchema.parseAsync(req.body);
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

    const project = await getProjectByIdAndWorkspaceIdService({ projectId, workspace });
    if (!project) {
        throw new AppError({
            publicMessage: `Project not found with id:${projectId}`,
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
        requiredPermissions: [PermissionEnum.CREATE_TASK],
    });

    const task = await createTaskService({
        userId,
        workspaceId,
        projectId,
        body: {
            title: body.title,
            description: body.description,
            priority: body.priority,
            status: body.status,
            assignedTo: body.assignedTo,
            dueDate: body.dueDate,
        },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.CREATED,
        status: "success",
        message: "Task created successfully",
        data: { task },
    });
});
