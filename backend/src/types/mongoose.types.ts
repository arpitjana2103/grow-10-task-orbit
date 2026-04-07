import type { Types } from "mongoose";

export type TLeanDocument<T> = T & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};
