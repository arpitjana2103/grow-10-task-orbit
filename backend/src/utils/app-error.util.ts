import type { T_HttpStatusCode } from "../config/http.config.js";
import type { T_ErrorCodeEnum } from "../enums/error-code.enum.js";

import { ErrorCodeEnum } from "../enums/error-code.enum.js";

type AppErrorOptions = {
    publicMessage: string;
    internalMessage?: string;
    statusCode: T_HttpStatusCode;
    errorCode?: T_ErrorCodeEnum;
};

export class AppError extends Error {
    readonly statusCode: T_HttpStatusCode;
    readonly errorCode: T_ErrorCodeEnum;

    readonly publicMessage: string;
    readonly internalMessage?: string | undefined;
    readonly isOperational: boolean;

    constructor({
        publicMessage,
        internalMessage = undefined,
        statusCode,
        errorCode = ErrorCodeEnum.UNKNOWN_ERROR,
    }: AppErrorOptions) {
        super(internalMessage || publicMessage);

        this.statusCode = statusCode;
        this.errorCode = errorCode;

        this.publicMessage = publicMessage;
        this.internalMessage = internalMessage;

        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
        /*
        Error.captureStackTrace(this, this.constructor) : Explanation
        -------------------------------------------------------------
        this → refers to the current instance of your AppError.
        this.constructor → refers to the AppError class itself.

        This tells JavaScript:
        "Start the stack trace from this point, and exclude everything above this constructor."
        */
    }
}
