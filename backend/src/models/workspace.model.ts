import mongoose, { Schema, type Document } from "mongoose";
import { generateInviteCode } from "../utils/generate-invitecode.js";

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
            ref: "User",
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

const WorkspaceModel = mongoose.model<WorkspaceDocument>("Workspace", workspaceSchema);

export default WorkspaceModel;
