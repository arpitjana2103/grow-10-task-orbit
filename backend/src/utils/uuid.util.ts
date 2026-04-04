import { v4 as uuidv4 } from "uuid";

export function generateInviteCode(): string {
    return uuidv4().replace(/-/g, "").substring(0, 8);
}

export function generateTaskCode(): string {
    return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`;
}
