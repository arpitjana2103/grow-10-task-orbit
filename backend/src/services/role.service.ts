import type { TPermissionEnum } from "../enums/role.enum.js";
import type { RoleDocument } from "../models/role.model.js";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { AppError } from "../utils/errors/app-error.util.js";

export const roleGuard = function (data: {
    role: RoleDocument;
    requiredPermissions: TPermissionEnum[];
}) {
    const { role, requiredPermissions } = data;

    const rolePermissionsSet = new Set(role.permissions);
    const missingPermissions: TPermissionEnum[] = [];

    console.log(rolePermissionsSet);
    console.log(requiredPermissions);
    const hasPermission = requiredPermissions.every(function (p) {
        if (rolePermissionsSet.has(p)) return true;
        else {
            missingPermissions.push(p);
            return false;
        }
    });

    if (!hasPermission) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: "You do not have necessery permission to perform this operation",
            internalMessage: `Access denied: role=${role.name}, missingPermissions=[${missingPermissions.join(", ")}]`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }
};
