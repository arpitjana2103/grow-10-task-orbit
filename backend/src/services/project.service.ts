import ProjectModel from "../models/project.model.js";

export const createProjectService = async function (data: {
    userId: string;
    workspaceId: string;
    body: {
        emoji: string | undefined;
        name: string;
        description: string | undefined;
    };
}) {
    const {
        userId,
        workspaceId,
        body: { emoji, name, description },
    } = data;

    const project = new ProjectModel({
        emoji: emoji,
        name: name,
        description: description,
        workspace: workspaceId,
        createdBy: userId,
    });

    return await project.save();
};
