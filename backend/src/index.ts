import express from "express";
import cors from "cors";
import session from "cookie-session";
import ms from "ms";
import qs from "qs";
import "dotenv/config";

import type { Request, Response, NextFunction } from "express";

import { config, runningOnProduction } from "./config/app.config.js";
import connectDatabase from "./config/database.config.js";

const app = express();

// Middleware: Parses JSON request bodies
// - Applies only to Content-Type: application/json
// - Attaches parsed payload to req.body
// - Payload size limit: 10MB
// - Invalid JSON → 400 Bad Request
app.use(express.json({ limit: "10mb" }));

// Config: Custom query parser using qs
// - Parses URL query strings into structured objects
// - Supports nested objects and arrays (qs.parse)
// - Overrides default Express query parser
app.set("query parser", function (queryString: string) {
    qs.parse(queryString);
});

// Middleware: Parses URL-encoded request bodies
// - Applies to Content-Type: application/x-www-form-urlencoded
// - Attaches parsed payload to req.body
// - Supports rich objects/arrays (extended: true)
// - Payload size limit: 10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: Configures CORS policy
// - Allows origin: https://myapp.com
// - Permits methods: GET, POST, PUT, DELETE
// - Allows headers: Content-Type, Authorization
// - Enables credentials (cookies, auth headers)
// - Preflight cache duration: 24h (maxAge in seconds)
app.use(
    cors({
        origin: "https://myapp.com",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        maxAge: ms("24h") / 1000,
    }),
);

// Middleware: Configures session management
// - Session name: "session"
// - Signs cookies using SESSION_SECRET
// - Session expiry: 24h (maxAge)
// - secure flag enabled in production only
// - httpOnly prevents client-side JS access
// - sameSite: "lax" (CSRF mitigation)
app.use(
    session({
        name: "session",
        keys: [config.SESSION_SECRET],
        maxAge: ms("24h"),
        secure: runningOnProduction(),
        httpOnly: true,
        sameSite: "lax",
    }),
);

// Server Home Route
app.get("/", function (req: Request, res: Response, next: NextFunction): void {
    res.status(200).json({
        message: "Welcome To TaskOrbit Server.",
    });
    return;
});

// Starts HTTP server on configured PORT and logs environment details
app.listen(config.PORT, async function () {
    await connectDatabase("local");
    console.log(`🛜 Server: http://localhost:${config.PORT} [env:${config.NODE_ENV}]`);
});
