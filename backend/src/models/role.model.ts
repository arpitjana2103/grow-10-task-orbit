import type { T_PermissionEnum, T_RoleEnum } from "../enums/role.enum.js";
import type { Document } from "mongoose";

import mongoose, { Schema } from "mongoose";

import { ModelEnum } from "../enums/model.enum.js";
import { PermissionEnum, RoleEnum } from "../enums/role.enum.js";
import { RolePermissions } from "../utils/role-permission.util.js";

export interface RoleDocument extends Document {
    name: T_RoleEnum;
    permissions: Array<T_PermissionEnum>;
}

const roleSchema = new Schema<RoleDocument>(
    {
        name: {
            type: String,
            enum: Object.values(RoleEnum),
            required: true,
            unique: true,
        },
        permissions: {
            type: [String],
            enum: Object.values(PermissionEnum),
            default: function (this: RoleDocument): Array<T_PermissionEnum> {
                return RolePermissions[this.name];
            },
        },
    },
    {
        timestamps: true,
    },
);

const RoleModel = mongoose.model<RoleDocument>(ModelEnum.ROLE, roleSchema);
export default RoleModel;
