import type { HydratedDocument, Model, QueryWithHelpers, Types } from "mongoose";

import mongoose from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { bcryptCompare, bcryptHash } from "../utils/bcrypt.util.js";

type UserProps = {
    name: string;
    email: string;
    password: string | null;
    profilePicture: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    currentWorkspace: Types.ObjectId | null;
    emailVerified: boolean;
};

type UserMethods = {
    comparePassword(candidate: string): Promise<boolean>;
    omitPassword(): Omit<UserProps, "password">;
};

type UserQueryHelper = {
    byEmail(email: string): UserQuery<UserDoc | null>;
};

export type UserDoc = HydratedDocument<UserProps, UserMethods, UserQueryHelper>;
type UserQuery<R> = QueryWithHelpers<R, UserDoc, UserQueryHelper>;
type UserModel = Model<UserProps, UserQueryHelper, UserMethods>;

const userSchema = new mongoose.Schema<UserProps, UserModel, UserMethods, UserQueryHelper>(
    {
        name: {
            type: String,
            required: false,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, select: false },
        profilePicture: {
            type: String,
            default: null,
        },
        currentWorkspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelEnum.WORKSPACE,
        },
        emailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
    },
    {
        timestamps: true,
        methods: {
            omitPassword: function (): Omit<UserProps, "password"> {
                const { password, ...rest } = this.toObject();
                return rest;
            },
            comparePassword: async function (value: string): Promise<boolean> {
                if (!this.password) return false;
                return bcryptCompare(value, this.password);
            },
        },
        query: {
            byEmail(this: UserQuery<UserDoc | null>, email: string) {
                return this.findOne({ email });
            },
        },
    },
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        if (this.password) {
            this.password = await bcryptHash(this.password);
        }
    }
});

const UserModel = mongoose.model<UserProps, UserModel>(ModelEnum.USER, userSchema);
export default UserModel;
