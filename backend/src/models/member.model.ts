import type { RoleDocument } from "./roles.model.js";
import type { Document, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";

export interface MemberDocument extends Document {
    userId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    role: Types.ObjectId | RoleDocument;
    joinedAt: Date;
}

const memberSchema = new Schema<MemberDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            required: true,
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.WORKSPACE,
            required: true,
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.ROLE,
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

const MemberModel = mongoose.model<MemberDocument>(ModelEnum.MEMBER, memberSchema);

export default MemberModel;
