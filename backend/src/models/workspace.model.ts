import mongoose, { Schema, type Document } from "mongoose";
import { generateInviteCode } from "../utils/uuid.js";
import { ModelEnum } from "../enums/model.enum.js";

export interface WorkspaceDocument extends Document {
    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
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
