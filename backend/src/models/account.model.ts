import type { TAccountProviderEnum } from "../enums/account-provider.enum.js";
import type { Document, Types } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { AccountProviderEnum } from "../enums/account-provider.enum.js";
import { ModelEnum } from "../enums/model.enum.js";

export interface AccountDocument extends Document {
    provider: TAccountProviderEnum;
    providerId: string;
    userId: Types.ObjectId;
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
        timestamps: false,
        toJSON: {
            transform(_doc, obj): void {
                delete obj.refreshToken;
            },
        },
    },
);

const AccountModel = mongoose.model<AccountDocument>(ModelEnum.ACCOUNT, accountSchema);
export default AccountModel;
