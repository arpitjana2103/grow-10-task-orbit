import emojiRegex from "emoji-regex";
import { z } from "zod";

const regex = emojiRegex();

const emojiSchema = z.string().refine(
    (val) => {
        const matches = val.match(regex);
        return (
            matches?.length === 1 && // only 1 emoji found
            matches[0] === val // entire string is that emoji
        );
    },
    {
        message: "must be a emoji (count: 1)",
    },
);

const nameSchema = z.string().trim().min(1).max(255);
const descriptionSchema = z.string().trim();

export const projectIdSchema = z.string().trim().min(1);
export const projectPaginationQuerySchema = z.object({
    pageSize: z.coerce.number().min(1).optional(),
    pageNumber: z.coerce.number().min(1).optional(),
});

export const createProjectSchema = z.object({
    emoji: emojiSchema.optional(),
    name: nameSchema,
    description: descriptionSchema.optional(),
});

export const updateProjectSchema = z.object({
    emoji: emojiSchema.optional(),
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
});
