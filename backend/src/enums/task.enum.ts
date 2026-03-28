export const TaskStatusEnum = {
    BACKLOG: "BACKLOG",
    TODO: "TODO",
    IN_PROCESS: "IN_PROCESS",
    IN_REVIEW: "IN_REVIEW",
    DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
} as const;

export type T_TaskStatusEnum = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];
export type T_TaskPriorityEnum = (typeof TaskPriorityEnum)[keyof typeof TaskPriorityEnum];
