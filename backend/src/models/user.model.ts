import type { HydratedDocument, Model, QueryWithHelpers, Types } from "mongoose";

import mongoose from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { bcryptCompare, bcryptHash } from "../utils/bcrypt.util.js";

type TUserProps = {
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

type TUserMethods = {
    comparePassword(candidate: string): Promise<boolean>;
    omitPassword(): Omit<TUserProps, "password">;
};

type TUserQueryHelper = {
    byEmail(email: string): TUserQuery<TUserDoc | null>;
};

export type TUserDoc = HydratedDocument<TUserProps, TUserMethods, TUserQueryHelper>;
type TUserModel = Model<TUserProps, TUserQueryHelper, TUserMethods>;
type TUserQuery<R> = QueryWithHelpers<R, TUserDoc, TUserQueryHelper>;

const userSchema = new mongoose.Schema<TUserProps, TUserModel, TUserMethods, TUserQueryHelper>(
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
        timestamps: false,
        methods: {
            omitPassword: function (): Omit<TUserProps, "password"> {
                const { password, ...rest } = this.toObject();
                return rest;
            },
            comparePassword: async function (this: TUserDoc, value: string): Promise<boolean> {
                if (!this.password) return false;
                return bcryptCompare(value, this.password);
            },
        },
        query: {
            byEmail(this: TUserQuery<TUserDoc | null>, email: string) {
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

const UserModel = mongoose.model<TUserProps, TUserModel>(ModelEnum.USER, userSchema);
export default UserModel;
