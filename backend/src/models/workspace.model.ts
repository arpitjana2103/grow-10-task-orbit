import type { TLeanDocument } from "../types/mongoose.types.js";
import type { Document, HydratedDocument, Model, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { generateInviteCode } from "../utils/uuid.util.js";

type TWorkspaceProps = {
    name: string;
    description: string;
    owner: Types.ObjectId;
    inviteCode: string;
};

type TWorkspaceMethods = {
    resetInviteCode(): void;
};

type TWorkspaceModel = Model<TWorkspaceProps, {}, TWorkspaceMethods>;

export type TWorkspaceDoc = HydratedDocument<TWorkspaceProps, TWorkspaceMethods>;
export type TLeanWorkspaceDoc = TLeanDocument<TWorkspaceProps>;

const workspaceSchema = new Schema<TWorkspaceProps, TWorkspaceModel, TWorkspaceMethods>(
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

const WorkspaceModel = mongoose.model<TWorkspaceProps, TWorkspaceModel>(
    ModelEnum.WORKSPACE,
    workspaceSchema,
);

export default WorkspaceModel;
