import mongoose, { Schema, type Document } from "mongoose";
import {
    TaskPriorityEnum,
    TaskStatusEnum,
    type T_TaskPriorityEnum,
    type T_TaskStatusEnum,
} from "../enums/task.enum.js";
import { generateTaskCode } from "../utils/uuid.js";
import { ModelEnum } from "../enums/model.enum.js";

export interface TaskDocument extends Document {
    taskCode: string;
    title: string;
    description: string | null;
    project: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;
    status: T_TaskStatusEnum;
    priority: T_TaskPriorityEnum;
    assignedTo: mongoose.Types.ObjectId | null;
    createdBy: mongoose.Types.ObjectId;
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
        timestamps: true,
    },
);

const TaskModel = mongoose.model<TaskDocument>(ModelEnum.TASK, taskSchema);
export default TaskModel;
