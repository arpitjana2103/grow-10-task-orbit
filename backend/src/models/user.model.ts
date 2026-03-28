import mongoose, { Schema as MongooseSchema, type Document } from "mongoose";
import { bcryptCompare, bcryptHash } from "../utils/bcrypt.js";
import { ModelEnum } from "../enums/model.enum.js";

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
            ref: ModelEnum.WORKSPACE,
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
    },
    {
        timestamps: true,
        methods: {
            omitPassword: function (): Omit<UserDocument, "password"> {
                const userObject = this.toObject();
                delete userObject.password;
                return userObject;
            },
            comparePassword: async function (value: string): Promise<boolean> {
                if (!this.password) return false;
                return bcryptCompare(value, this.password);
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

const UserModel = mongoose.model<UserDocument>(ModelEnum.USER, userSchema);
export default UserModel;
