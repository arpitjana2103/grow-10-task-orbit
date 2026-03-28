export const ModelEnum = {
    ACCOUNT: "Account",
    PROJECT: "Project",
    TASK: "Task",
    USER: "User",
    WORKSPACE: "Workspace",
} as const;

export type T_ModelEnum = (typeof ModelEnum)[keyof typeof ModelEnum];
