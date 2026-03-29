import "dotenv/config.js";

import type { T_RoleEnum } from "../enums/role.enum.js";

import mongoose from "mongoose";

import connectDatabase from "../config/database.config.js";
import RoleModel from "../models/role.model.js";
import { RolePermissions } from "../utils/role-permission.js";

const seedRoles = async function (): Promise<void> {
    await connectDatabase("local");
    let session = await mongoose.startSession();
    try {
        session.startTransaction();

        await RoleModel.deleteMany({}).session(session);

        for (const roleName in RolePermissions) {
            const role = roleName as T_RoleEnum;
            const permissions = RolePermissions[role];

            // Check if the role already exist
            const existingRole = await RoleModel.findOne({ name: role }).session(session);
            if (!existingRole) {
                const newRole = new RoleModel({
                    name: role,
                    permissions: permissions,
                });
                await newRole.save({ session });
            }
        }

        await session.commitTransaction();

        console.log("🌱 Role Seeding Completed");
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
    } finally {
        session.endSession();
        await mongoose.connection.close();
    }
};

seedRoles();
