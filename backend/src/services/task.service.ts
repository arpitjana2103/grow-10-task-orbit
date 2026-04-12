import type { TTaskPriorityEnum, TTaskStatusEnum } from "../enums/task.enum.js";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import MemberModel from "../models/member.model.js";
import TaskModel from "../models/task.model.js";
import { AppError } from "../utils/errors/app-error.util.js";

export const createTaskService = async function (data: {
    userId: string;
    workspaceId: string;
    projectId: string;
    body: {
        title: string;
        description: string;
        priority: string;
        status: string | undefined;
        assignedTo: string | null | undefined;
        dueDate: Date | undefined;
    };
}) {
    const { userId, workspaceId, projectId, body } = data;
    const { title, description, priority, status, assignedTo, dueDate } = body;

    // If assignedTo is provided, verify the user is actually a member of the workspace
    if (assignedTo) {
        const isAssigneeMember = await MemberModel.exists({
            user: assignedTo,
            workspace: workspaceId,
        });

        if (!isAssigneeMember) {
            throw new AppError({
                publicMessage: "Assigned user is not a member of this workspace",
                internalMessage: `assignedTo user:${assignedTo} is not a member of workspace:${workspaceId}`,
                statusCode: HTTPSTATUSCODE.BAD_REQUEST,
                errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
            });
        }
    }

    const task = new TaskModel({
        title,
        description,
        priority,
        status,
        assignedTo: assignedTo ?? null,
        dueDate: dueDate ?? null,
        project: projectId,
        workspace: workspaceId,
        createdBy: userId,
    });

    return await task.save();
};

export const updateTaskService = async function (data: {
    taskId: string;
    workspaceId: string;
    projectId: string;
    body: {
        title: string | undefined;
        description: string | undefined;
        priority: string | undefined;
        status: string | undefined;
        assignedTo: string | null | undefined;
        dueDate: Date | undefined;
    };
}) {
    const { taskId, workspaceId, projectId, body } = data;
    const { title, description, priority, status, assignedTo, dueDate } = body;

    // Find the task scoped to the correct project + workspace
    const task = await TaskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId,
    });

    if (!task) {
        throw new AppError({
            publicMessage: `Task not found with id:${taskId} in project:${projectId}`,
            internalMessage: `Task _id:${taskId} not found for project:${projectId} workspace:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    // Apply only the fields that were explicitly sent in the request
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority as TTaskPriorityEnum;
    if (status !== undefined) task.status = status as TTaskStatusEnum;
    if (dueDate !== undefined) task.dueDate = dueDate ?? null;

    if (assignedTo) {
        const isAssigneeMember = await MemberModel.exists({
            user: assignedTo,
            workspace: workspaceId,
        });

        if (!isAssigneeMember) {
            throw new AppError({
                publicMessage: "Assigned user is not a member of this workspace",
                internalMessage: `assignedTo user:${assignedTo} is not a member of workspace:${workspaceId}`,
                statusCode: HTTPSTATUSCODE.BAD_REQUEST,
                errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
            });
        }
    }

    return await task.save();
};
