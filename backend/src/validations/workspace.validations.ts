import { z } from "zod";

const workspaceNameSchema = z.string().trim().min(1).max(255);
const workspaceDescriptionSchema = z.string().trim().optional();

export const createWorkspaceSchema = z.object({
    name: workspaceNameSchema,
    description: workspaceDescriptionSchema,
});

export const updateWorkspaceSchema = z.object({
    name: workspaceNameSchema,
    description: workspaceDescriptionSchema,
});
