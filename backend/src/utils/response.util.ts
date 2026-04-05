import type { T_HttpStatusCode } from "../config/http.config.js";
import type { T_ErrorCodeEnum } from "../enums/error-code.enum.js";
import type { Response } from "express";

type StatusType = "success" | "fail" | "error";
type ApiData = Record<string, unknown>;

export function sendResponse(
    res: Response,
    options: {
        statusCode: T_HttpStatusCode;
        status: StatusType;
        internalMessage?: string;
        message?: string;
        data?: ApiData;
        env?: string;
        error?: any;
        errorCode?: T_ErrorCodeEnum;
        stack?: any;
    },
): Response {
    const { statusCode, status, data, env, message, internalMessage, error, errorCode, stack } =
        options;

    return res.status(statusCode).json({
        success: status === "success",
        status: status,
        ...(message && { message: message.toLowerCase() }),
        ...(internalMessage && { internalMessage: internalMessage.toLowerCase() }),
        ...(env && { env: env }),
        ...(data && { data }),
        ...(error && { error }),
        ...(errorCode && { errorCode: errorCode }),
        ...(stack && { stack: stack }),
    });
}
