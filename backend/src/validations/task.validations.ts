import { z } from "zod";

import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum.js";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim();
export const assignedToSchema = z.string().trim().min(1).nullable();
export const prioritySchema = z.enum(Object.values(TaskPriorityEnum) as [string, ...string[]]);
export const statusSchema = z.enum(Object.values(TaskStatusEnum) as [string, ...string[]]);

export const dueDateSchema = z
    .string()
    .trim()
    .min(1, { message: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format",
    })
    .refine(
        (val) => {
            const [y, m, d] = val.split("-").map(Number);
            const date = new Date(val);

            return date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d;
        },
        {
            message: "Invalid calendar date",
        },
    )
    .transform((val) => new Date(val));

export const taskIdSchema = z.string().trim().min(1);

export const createTaskSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    priority: prioritySchema,
    status: statusSchema.optional(),
    assignedTo: assignedToSchema.optional(),
    dueDate: dueDateSchema.optional(),
});

export const updateTaskSchema = z.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    priority: prioritySchema.optional(),
    status: statusSchema.optional(),
    assignedTo: assignedToSchema.optional(),
    dueDate: dueDateSchema.optional(),
});
