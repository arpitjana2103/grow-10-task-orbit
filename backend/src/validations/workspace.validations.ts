import { z } from "zod";

import { RoleEnum } from "../enums/role.enum.js";

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

export const changeRoleSchema = z.object({
    roleName: z.enum(Object.values(RoleEnum)),
    memberId: z.string().trim().min(1).max(255),
});

export const workspaceIdSchema = z.string().trim().min(1).max(255);

enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue",
}

const ColorSchema = z.enum(Color); // ✅
