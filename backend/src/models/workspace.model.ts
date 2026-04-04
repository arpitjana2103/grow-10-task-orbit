import type { Document, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { generateInviteCode } from "../utils/uuid.util.js";

export interface WorkspaceDocument extends Document {
    name: string;
    description: string;
    owner: Types.ObjectId;
    inviteCode: string;
    createdAt: string;
    updatedAt: string;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: false },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            required: true,
        },
        inviteCode: {
            type: String,
            required: true,
            unique: true,
            default: generateInviteCode,
        },
    },
    {
        timestamps: true,
        methods: {
            resetInviteCode: function (this: WorkspaceDocument): void {
                this.inviteCode = generateInviteCode();
            },
        },
    },
);

const WorkspaceModel = mongoose.model<WorkspaceDocument>(ModelEnum.WORKSPACE, workspaceSchema);

export default WorkspaceModel;
