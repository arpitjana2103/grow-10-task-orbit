import type { Document, HydratedDocument, Model, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { generateInviteCode } from "../utils/uuid.util.js";

type WorkspaceProps = {
    name: string;
    description: string;
    owner: Types.ObjectId;
    inviteCode: string;
};

type WorkspaceMethods = {
    resetInviteCode(): void;
};

type WorkspaceModel = Model<WorkspaceProps, {}, WorkspaceMethods>;
export type WorkspaceDoc = HydratedDocument<WorkspaceProps, WorkspaceMethods>;

const workspaceSchema = new Schema<WorkspaceProps, WorkspaceModel, WorkspaceMethods>(
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
            resetInviteCode: function (): void {
                this.inviteCode = generateInviteCode();
            },
        },
    },
);

const WorkspaceModel = mongoose.model<WorkspaceProps, WorkspaceModel>(
    ModelEnum.WORKSPACE,
    workspaceSchema,
);

export default WorkspaceModel;
