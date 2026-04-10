import { z } from "zod";

import { RoleEnum } from "../enums/role.enum.js";

const workspaceNameSchema = z.string().trim().min(1).max(255);
const workspaceDescriptionSchema = z.string().trim().optional();

export const createWorkspaceSchema = z.object({
    name: workspaceNameSchema,
    description: workspaceDescriptionSchema,
});

export const updateWorkspaceSchema = z.object({
    name: workspaceNameSchema.optional(),
    description: workspaceDescriptionSchema.optional(),
});

export const changeRoleSchema = z.object({
    roleName: z.enum(Object.values(RoleEnum)),
});

export const workspaceIdSchema = z.string().trim().min(1).max(255);
export const workspaceInviteCodeSchema = z.string().trim().length(8);
