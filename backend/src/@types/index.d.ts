import type { UserDoc } from "../models/user.model.ts";

// What it does ?
// It tells TypeScript:
// Whenever you see Express.User, treat it as my UserDocument
declare global {
    namespace Express {
        interface User extends UserDoc {}
    }
}
