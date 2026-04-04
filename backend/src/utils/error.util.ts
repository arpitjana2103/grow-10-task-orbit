import stringify from "safe-stable-stringify";

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    if (typeof error === "object" && error !== null) {
        return stringify(error);
    }

    return String(error);
}
