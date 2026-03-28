import type { Document, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";

export interface ProjectDocument extends Document {
    name: string;
    description: string | null;
    emoji: string;
    workspace: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        emoji: {
            type: String,
            required: false,
            trim: true,
            default: "🎒",
        },
        description: { type: String, required: false },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelEnum.WORKSPACE,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const ProjectModel = mongoose.model<ProjectDocument>(ModelEnum.PROJECT, projectSchema);

export default ProjectModel;
