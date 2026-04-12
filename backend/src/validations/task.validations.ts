import { z } from "zod";

import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum.js";

// Coerces a single string value into a single-element array.
// Leaves arrays as-is. Returns undefined if value is absent.
// Needed because qs may parse a single query value as a string, not an array.
const coerceToStringArray = (val: unknown) =>
    val === undefined ? undefined : Array.isArray(val) ? val : [val];

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

export const taskQuerySchema = z.object({
    // Filter by a specific project inside the workspace
    projectId: z.string().trim().min(1).optional(),
    // One or more statuses  e.g. ?status[]=TODO&status[]=DONE
    status: z.preprocess(coerceToStringArray, z.array(statusSchema).optional()),
    // One or more priorities  e.g. ?priority[]=HIGH&priority[]=MEDIUM
    priority: z.preprocess(coerceToStringArray, z.array(prioritySchema).optional()),
    // One or more assignee user IDs  e.g. ?assignedTo[]=<userId>
    assignedTo: z.preprocess(coerceToStringArray, z.array(z.string().trim().min(1)).optional()),
    // Case-insensitive substring match on task title
    keyword: z.string().trim().min(1).optional(),
    // Exact calendar-day filter  e.g. ?dueDate=2025-12-31
    dueDate: dueDateSchema.optional(),
    // Pagination
    pageNumber: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
