import type { HydratedDocument } from "mongoose";

import mongoose from "mongoose";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { logger } from "../config/logger.config.js";
import { AccountProviderEnum, type T_AccountProviderEnum } from "../enums/account-provider.enum.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { RoleEnum } from "../enums/role.enum.js";
import AccountModel from "../models/account.model.js";
import MemberModel from "../models/member.model.js";
import RoleModel from "../models/role.model.js";
import UserModel, { type UserDocument } from "../models/user.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import { AppError } from "../utils/app-error.util.js";
import { getErrorMessage } from "../utils/error.util.js";

export const ensureUser = async function (data: {
    provider: T_AccountProviderEnum;
    name: string;
    providerId: string;
    picture?: string;
    email: string;
}): Promise<HydratedDocument<UserDocument> | null> {
    const { provider, name, providerId, picture, email } = data;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        let user = await UserModel.findOne({ email }).session(session);

        if (!user) {
            // 1. Create User
            user = new UserModel({
                email: email,
                name: name,
                profilePicture: picture || null,
                emailVerified: provider === AccountProviderEnum.GOOGLE,
            });
            await user.save({ session });

            // 2. Create Account
            const account = new AccountModel({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            });
            await account.save({ session });

            // 3. Create a new workspace for the new User
            const workspace = new WorkspaceModel({
                name: `${user.name}'s Workspace`,
                description: `Default Workspace, created for ${user.name}`,
                owner: user._id,
            });
            await workspace.save({ session });

            // 4. Find 'OWNER' Role
            const ownerRole = await RoleModel.findOne({
                name: RoleEnum.OWNER,
            }).session(session);
            if (!ownerRole) {
                throw new AppError({
                    internalMessage: `Role '${RoleEnum.OWNER}' not found in database`,
                    publicMessage: "Service configuration error. Please try again later.",
                    statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
                    errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
                });
            }

            // 5. Create Member for the new Workspace
            const member = new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
            });
            await member.save({ session });

            // 6. Set the new workspace as user's current workspace
            user.currentWorkspace = workspace._id;
            await user.save({ session });
        }
        await session.commitTransaction();
        return user;
    } catch (error) {
        logger.error({ err: error });
        await session.abortTransaction();
        throw new AppError({
            publicMessage: "User sign-in/up failed",
            internalMessage: getErrorMessage(error),
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
        });
    } finally {
        session.endSession();
    }
};
