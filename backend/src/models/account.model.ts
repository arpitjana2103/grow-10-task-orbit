import { AccountProviderEnum, type T_AccountProviderEnum } from "../enums/account-provider.enum.js";
import mongoose, { Schema, type Document } from "mongoose";
import { ModelEnum } from "../enums/model.enum.js";

export interface AccountDocument extends Document {
    provider: T_AccountProviderEnum;
    providerId: string;
    userId: mongoose.Types.ObjectId;
    refreshToken?: string | null;
    tokenExpiry: Date | null;
    createdAt: Date;
}

const accountSchema = new Schema<AccountDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: ModelEnum.USER,
            required: true,
        },
        provider: {
            type: String,
            enum: Object.values(AccountProviderEnum),
            required: true,
        },
        providerId: {
            type: String,
            required: true,
            unique: true,
        },
        refreshToken: { type: String, default: null },
        tokenExpiry: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, obj): void {
                delete obj.refreshToken;
            },
        },
    },
);

const AccountModel = mongoose.model<AccountDocument>(ModelEnum.ACCOUNT, accountSchema);
export default AccountModel;
