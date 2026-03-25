import type { THttpStatusCode } from "../config/http.config.js";
import { ErrorCodeEnum, type TErrorCode } from "../enums/error-code.enum.js";

// Class: Custom application error
// - Extends native Error with statusCode and errorCode
// - Used for operational/expected errors across app
export class AppError extends Error {
    readonly statusCode: THttpStatusCode;
    readonly errorCode: TErrorCode;

    constructor(
        message: string,
        statusCode: THttpStatusCode,
        errorCode: TErrorCode = ErrorCodeEnum.UNKNOWN_ERROR,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
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
