import type { UserDoc } from "../models/user.model.js";

import mongoose from "mongoose";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { logger } from "../config/logger.config.js";
import { AccountProviderEnum, type T_AccountProviderEnum } from "../enums/account-provider.enum.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { RoleEnum } from "../enums/role.enum.js";
import AccountModel from "../models/account.model.js";
import MemberModel from "../models/member.model.js";
import RoleModel from "../models/role.model.js";
import UserModel from "../models/user.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import { getErrorMessage } from "../utils/error.util.js";
import { AppError } from "../utils/errors/app-error.util.js";

interface UserData {
    provider: T_AccountProviderEnum;
    name: string;
    providerId: string;
    picture: string | null;
    email: string;
    password: string | null;
}

export const ensureUser = async function (data: UserData): Promise<UserDoc> {
    const { email, provider, providerId, password } = data;

    try {
        let user = await UserModel.findOne({ email });
        if (user) await verifyUser({ user, provider, providerId, password });
        if (!user) user = await createUser(data);
        return user;
    } catch (error) {
        logger.error({ err: error });
        if (error instanceof AppError) throw error;
        throw new AppError({
            publicMessage: "User sign-in/up failed",
            internalMessage: getErrorMessage(error),
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
        });
    }
};

export const verifyUser = async function (data: {
    user: UserDoc;
    provider: T_AccountProviderEnum;
    password: string | null;
    providerId: string;
}): Promise<void> {
    const { user, provider, password, providerId } = data;
    const userId = user._id.toString();

    // 1. Check if Account exists for this provider
    const account = await AccountModel.findOne({ userId: userId });
    if (!account) {
        throw new AppError({
            publicMessage: "Account not found",
            internalMessage: `No account with provider '${provider}' found for userId: ${userId}`,
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
        });
    }

    // 2. Check if User is active
    if (!user.isActive) {
        throw new AppError({
            publicMessage: "Your account has been deactivated",
            internalMessage: `Inactive user attempted login: ${userId}`,
            statusCode: HTTPSTATUSCODE.FORBIDDEN,
            errorCode: ErrorCodeEnum.ACCESS_FORBIDDEN,
        });
    }

    // 3. Match providerId for OAuth provider : Google
    if (provider === AccountProviderEnum.GOOGLE) {
        if (account.providerId !== providerId) {
            throw new AppError({
                publicMessage: "Authentication failed",
                internalMessage: `Google providerId mismatch for userId: ${userId}`,
                statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
            });
        }
    }

    // 3. Check if Password is correct (EMAIL provider only)
    if (provider === AccountProviderEnum.EMAIL) {
        if (!password) {
            throw new AppError({
                publicMessage: "Password is required",
                internalMessage: "Password missing during email login verification",
                statusCode: HTTPSTATUSCODE.BAD_REQUEST,
                errorCode: ErrorCodeEnum.MISSING_REQUIRED_FIELD,
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError({
                publicMessage: "Invalid credentials",
                internalMessage: `Password mismatch for userId: ${userId}`,
                statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                errorCode: ErrorCodeEnum.AUTH_INVALID_TOKEN,
            });
        }
    }
};

export const createUser = async function (data: UserData): Promise<UserDoc> {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { provider, name, providerId, picture, email, password } = data;
        // 1. Create User
        if (provider === AccountProviderEnum.EMAIL && !password) {
            throw new AppError({
                publicMessage: "Password is required for email authentication",
                internalMessage: "Missing password for EMAIL provider during user creation",
                statusCode: HTTPSTATUSCODE.BAD_REQUEST,
                errorCode: ErrorCodeEnum.MISSING_REQUIRED_FIELD,
            });
        }
        const user = new UserModel({
            email: email,
            name: name,
            password: password,
            profilePicture: picture,
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

        return user;
    } catch (error) {
        logger.error({ err: error });
        await session.abortTransaction();
        if (error instanceof AppError) throw error;
        throw new AppError({
            publicMessage: "Failed to Create User",
            internalMessage: getErrorMessage(error),
            statusCode: HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
        });
    } finally {
        session.endSession();
    }
};
