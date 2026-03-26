import mongoose, { Schema as MongooseSchema, type Document } from "mongoose";
import { bcryptHash } from "../utils/bcrypt.js";

export interface UserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    profilePicture: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    currentWorkspace: mongoose.Types.ObjectId | null;
    comparePassword(value: string): Promise<boolean>;
    omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new MongooseSchema<UserDocument>(
    {
        name: {
            type: String,
            required: false,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, select: false },
        profilePicture: {
            type: String,
            default: null,
        },
        currentWorkspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
    },
    {
        timestamps: true,
        methods: {
            omitPassword(this: UserDocument): Omit<UserDocument, "password"> {
                const userObject = this.toObject();
                delete userObject.password;
                return userObject;
            },
        },
    },
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        if (this.password) {
            this.password = await bcryptHash(this.password);
        }
    }
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
