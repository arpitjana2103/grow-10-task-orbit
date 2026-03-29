import mongoose from "mongoose";

import { config } from "./app.config.js";

const connectDatabase = async function (type: "local" | "atlas"): Promise<void> {
    try {
        console.log(`🔁 Connecting to DB...`);
        const conn = await mongoose.connect(
            type === "local" ? config.MONGO_LOC_URI : config.get_MONGO_ATLAS_URI(),
        );
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.log("⛔ Database Connection Failed.");
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(error);
        }

        // Graceful shutdown
        await mongoose.connection.close();
        process.exit(0);
    }
};

export default connectDatabase;
