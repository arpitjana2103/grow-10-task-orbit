import type { TWorkspaceDoc } from "../models/workspace.model.js";

import MemberModel from "../models/member.model.js";
import UserModel from "../models/user.model.js";

export const ensureUserMembershipInWorkspace = async function (data: {
    userId: string;
    workspace: TWorkspaceDoc;
}) {
    const { userId, workspace } = data;
    const memberShip = await MemberModel.findOne({
        userId: userId,
        workspaceId: workspace._id,
    }).populate({
        path: "role",
        select: "name",
    });

    return memberShip;
};

export const getMembersInWorkspace = async function (data: { workspace: TWorkspaceDoc }) {
    const { workspace } = data;
    const members = await MemberModel.find({ workspaceId: workspace._id })
        .populate({
            path: "role",
            select: "name",
        })
        .populate({
            path: "userId",
            select: "name email profilePicture",
        })
        .select("-workspaceId");

    return members;
};
