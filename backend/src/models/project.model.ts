import mongoose, { Schema, type Document } from "mongoose";

export interface ProjectDocument extends Document {
    name: string;
    description: string | null;
    emoji: string;
    workspace: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
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
            ref: "Workspace",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);

export default ProjectModel;
