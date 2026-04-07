export const ModelEnum = {
    ACCOUNT: "Account",
    PROJECT: "Project",
    TASK: "Task",
    USER: "User",
    WORKSPACE: "Workspace",
    MEMBER: "Member",
    ROLE: "Role",
} as const;

export type TModelEnum = (typeof ModelEnum)[keyof typeof ModelEnum];
