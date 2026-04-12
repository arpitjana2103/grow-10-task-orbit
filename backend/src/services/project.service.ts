import type { TWorkspaceDoc } from "../models/workspace.model.js";

import mongoose from "mongoose";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { TaskStatusEnum } from "../enums/task.enum.js";
import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
import { AppError } from "../utils/errors/app-error.util.js";

export const createProjectService = async function (data: {
    userId: string;
    workspaceId: string;
    body: {
        emoji: string | undefined;
        name: string;
        description: string | undefined;
    };
}) {
    const {
        userId,
        workspaceId,
        body: { emoji, name, description },
    } = data;

    const project = new ProjectModel({
        emoji: emoji,
        name: name,
        description: description,
        workspace: workspaceId,
        createdBy: userId,
    });

    return await project.save();
};

export const getProjectsInWorkspaceService = async function (data: {
    workspace: TWorkspaceDoc;
    pageSize: number | undefined;
    pageNumber: number | undefined;
}) {
    const { workspace, pageSize, pageNumber } = data;
    const page = pageNumber || 1;
    const limit = pageSize || 10;
    const skip = (page - 1) * limit;

    const totalCount = await ProjectModel.countDocuments({ workspace: workspace._id });
    const totalPages = Math.ceil(totalCount / limit);
    const isInvalidPageNumber = page > totalPages;

    const projects = isInvalidPageNumber
        ? []
        : await ProjectModel.find({ workspace: workspace._id })
              .skip(skip)
              .limit(limit)
              .populate({ path: "createdBy", select: "name email profilePicture" })
              .sort({ createdAt: -1 });

    return {
        projects,
        pagination: {
            totalCount,
            totalPages,
            skipCount: isInvalidPageNumber ? totalPages : skip,
            pageNumber: page,
            pageSize: limit,
            pageNumberValid: !isInvalidPageNumber,
        },
    };
};

export const getProjectByIdAndWorkspaceIdService = async function (data: {
    projectId: string;
    workspace: TWorkspaceDoc;
}) {
    const { projectId, workspace } = data;

    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspace._id,
    }).populate({
        path: "createdBy",
        select: "name email profilePicture",
    });

    if (!project) {
        throw new AppError({
            publicMessage: `Project not found with id:${projectId} in workspace:${workspace._id.toString()}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    return project;
};

export const getProjectAnalyticsService = async function (data: {
    workspace: TWorkspaceDoc;
    projectId: string;
}) {
    const { workspace, projectId } = data;

    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspace._id,
    });

    if (!project) {
        throw new AppError({
            publicMessage: `Project not found with id:${projectId} in workspace:${workspace._id.toString()}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const currentDate = new Date();

    // USING Mongoose aggregate
    const taskAnalytics = await TaskModel.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $facet: {
                totalTasks: [{ $count: "count" }],
                overdueTasks: [
                    {
                        $match: {
                            dueDate: { $lt: currentDate },
                            status: {
                                $ne: TaskStatusEnum.DONE,
                            },
                        },
                    },
                    {
                        $count: "count",
                    },
                ],
                completedTasks: [
                    {
                        $match: {
                            status: TaskStatusEnum.DONE,
                        },
                    },
                    { $count: "count" },
                ],
            },
        },
    ]);

    const _analytics = taskAnalytics[0];

    const analytics = {
        totalTasks: _analytics.totalTasks[0]?.count || 0,
        overdueTasks: _analytics.overdueTasks[0]?.count || 0,
        completedTasks: _analytics.completedTasks[0]?.count || 0,
    };

    return analytics;
};
