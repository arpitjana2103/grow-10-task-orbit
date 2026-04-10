import type { RoleDocument } from "../models/role.model.js";
import type { TWorkspaceDoc } from "../models/workspace.model.js";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { RoleEnum, type TRoleEnum } from "../enums/role.enum.js";
import MemberModel from "../models/member.model.js";
import RoleModel from "../models/role.model.js";
import UserModel from "../models/user.model.js";
import { AppError } from "../utils/errors/app-error.util.js";

export const ensureUserMembershipInWorkspaceService = async function (data: {
    userId: string;
    workspace: TWorkspaceDoc;
}) {
    const { userId, workspace } = data;
    const memberShip = await MemberModel.findOne({
        user: userId,
        workspace: workspace._id,
    })
        .populate("role")
        .select("-__v");

    return memberShip;
};

export const getMembersInWorkspaceService = async function (data: { workspace: TWorkspaceDoc }) {
    const { workspace } = data;
    const members = await MemberModel.find({ workspace: workspace._id })
        .populate({
            path: "role",
            select: "name",
        })
        .populate({
            path: "user",
            select: "name email profilePicture",
        })
        .select("-workspace -createdAt -updatedAt -__v");

    return members.map(function (m) {
        return { ...m.toObject(), role: (m.role as RoleDocument).name };
    });
};

export const addMemberToWorkspaceService = async function (data: {
    workspace: TWorkspaceDoc;
    userId: string;
}) {
    const { workspace, userId } = data;
    const role = await RoleModel.findOne({ name: RoleEnum.MEMBER });

    if (!role) {
        throw new AppError({
            internalMessage: `Role '${RoleEnum.MEMBER}' not found in database`,
            publicMessage: "Service configuration error. Please try again later.",
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    await MemberModel.create({
        workspace: workspace._id,
        user: userId,
        role: role._id,
    });
};

export const changeMemberRoleService = async function (data: {
    workspace: TWorkspaceDoc;
    memberId: string;
    roleName: TRoleEnum;
}) {
    const { workspace, memberId, roleName } = data;

    const role = await RoleModel.findOne({ name: roleName });
    if (!role) {
        throw new AppError({
            internalMessage: `Role '${roleName}' not found in database`,
            publicMessage: `Invalid Role: '${roleName}' not found`,
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const member = await MemberModel.findOne({ workspace: workspace._id, _id: memberId });
    if (!member) {
        throw new AppError({
            internalMessage: `Member not found in workspace`,
            publicMessage: `member:${memberId} not found in workspace:${workspace._id}`,
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    member.role = role._id;
    const updatedMember = await member.save();
    return updatedMember.populate({ path: "role", select: "name" });
};
