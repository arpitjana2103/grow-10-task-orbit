import type { Document, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import {
    TaskPriorityEnum,
    TaskStatusEnum,
    type TTaskPriorityEnum,
    type TTaskStatusEnum,
} from "../enums/task.enum.js";
import { generateTaskCode } from "../utils/uuid.util.js";

export interface TaskDocument extends Document {
    taskCode: string;
    title: string;
    description: string | null;
    project: Types.ObjectId;
    workspace: Types.ObjectId;
    status: TTaskStatusEnum;
    priority: TTaskPriorityEnum;
    assignedTo: Types.ObjectId | null;
    createdBy: Types.ObjectId;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
    {
        taskCode: {
            type: String,
            unique: true,
            default: generateTaskCode,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: null,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.PROJECT,
            required: true,
        },
        workspace: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.WORKSPACE,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(TaskStatusEnum),
            default: TaskStatusEnum.TODO,
        },
        priority: {
            type: String,
            enum: Object.values(TaskPriorityEnum),
            default: TaskPriorityEnum.MEDIUM,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            required: true,
        },
        dueDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: false,
    },
);

const TaskModel = mongoose.model<TaskDocument>(ModelEnum.TASK, taskSchema);
export default TaskModel;
