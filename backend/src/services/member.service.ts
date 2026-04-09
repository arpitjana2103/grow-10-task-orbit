import type { RoleDocument } from "../models/role.model.js";
import type { TWorkspaceDoc } from "../models/workspace.model.js";

import MemberModel from "../models/member.model.js";
import UserModel from "../models/user.model.js";

export const ensureUserMembershipInWorkspaceService = async function (data: {
    userId: string;
    workspace: TWorkspaceDoc;
}) {
    const { userId, workspace } = data;
    const memberShip = await MemberModel.findOne({
        user: userId,
        workspace: workspace._id,
    }).populate({
        path: "role",
        select: "name",
    });

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
