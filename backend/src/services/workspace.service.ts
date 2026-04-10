import type { TLeanWorkspaceDoc, TWorkspaceDoc } from "../models/workspace.model.js";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { RoleEnum, type TRoleEnum } from "../enums/role.enum.js";
import { TaskStatusEnum } from "../enums/task.enum.js";
import MemberModel from "../models/member.model.js";
import RoleModel, { type RoleDocument } from "../models/role.model.js";
import TaskModel from "../models/task.model.js";
import UserModel from "../models/user.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import { AppError } from "../utils/errors/app-error.util.js";

export const createWorkspaceService = async function (
    userId: string,
    data: {
        name: string;
        description?: string | undefined;
    },
): Promise<TWorkspaceDoc> {
    const { name, description } = data;

    // 1. Find User
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new AppError({
            internalMessage: `User id='${userId}' not found in database`,
            publicMessage: "Service configuration error. Please try again later.",
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    // 2. Find Owner Role
    const ownerRole = await RoleModel.findOne({ name: RoleEnum.OWNER });
    if (!ownerRole) {
        throw new AppError({
            internalMessage: `Role '${RoleEnum.OWNER}' not found in database`,
            publicMessage: "Service configuration error. Please try again later.",
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    // 3. Create Workspace
    const workspace = new WorkspaceModel({
        name: name,
        description: description,
        owner: user._id,
    });
    await workspace.save();

    // 5. Create Member for the new Workspace
    const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
    });
    await member.save();

    // 6. Set the new workspace as user's current workspace
    user.currentWorkspace = workspace._id;
    await user.save();

    return workspace;
};

export const getAllWorkspacesUserIsMemberService = async function (userId: string) {
    const members = await MemberModel.find({ user: userId })
        .populate({ path: "workspace", select: "name description" })
        .populate({ path: "role", select: "name" })
        .lean()
        .exec();
    return members.map(function (m) {
        return { ...m.workspace, role: (m.role as RoleDocument).name };
    });
};

export const getWorkspaceAnalyticsService = async function (workspace: TWorkspaceDoc) {
    const today = new Date();

    const totalTasks = await TaskModel.countDocuments({
        workspace: workspace._id,
    });

    const overdueTasks = await TaskModel.countDocuments({
        workspace: workspace._id,
        dueDate: { $lt: today },
        status: { $ne: TaskStatusEnum.DONE },
    });

    const completedTasks = await TaskModel.countDocuments({
        workspace: workspace._id,
        status: TaskStatusEnum.DONE,
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        completedTasks,
    };

    return analytics;
};

export const updateWorkspaceService = async function (data: {
    workspace: TWorkspaceDoc;
    name: string | undefined;
    description: string | undefined;
}) {
    const { workspace, name, description } = data;
    if (name) workspace.name = name;
    if (description) workspace.description = description;

    const updatedWorkspace = await workspace.save();
    return updatedWorkspace;
};
