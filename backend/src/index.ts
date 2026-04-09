import "dotenv/config";
import "./config/passport.config.js";

import type { Request, Response, NextFunction } from "express";

// import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import ms from "ms";
import passport from "passport";
import qs from "qs";

import { config, runningOnProduction } from "./config/app.config.js";
import connectDatabase from "./config/database.config.js";
import { HTTPSTATUSCODE } from "./config/http.config.js";
import { handleAsyncError } from "./middlewares/async-handler.middleware.js";
import { authProtect } from "./middlewares/auth.middleware.js";
import { handleGlobalError } from "./middlewares/global-error-handler.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import workspaceRoutes from "./routes/workspace.route.js";

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
    return qs.parse(queryString);
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

// Middleware: Configures cookie-based session storage using cookie-session
// - Stores session data directly in the client-side cookie (no server-side store)
// - Cookie name: "to-session"
// - Signs cookie using SESSION_SECRET (integrity, not encryption)
// - Session expiry: 24h (maxAge)
// - secure: true in production (HTTPS only)
// - httpOnly: prevents client-side JS access
// - sameSite: "lax" (basic CSRF protection)
// - Note: Limited by cookie size (~4KB)
// app.use(
//     cookieSession({
//         // name: "to-session",
//         // keys: [config.SESSION_SECRET],
//         // maxAge: ms("24h"),
//         // secure: runningOnProduction(),
//         // httpOnly: true,
//         // sameSite: "lax",
//     }),
// );

// Middleware: Configures server-side session storage using express-session
// - Stores session data on the server (MemoryStore by default; replaceable with Redis/DB)
// - Cookie name: "to-session" (contains only session ID, not actual data)
// - Uses SESSION_SECRET to sign the session ID cookie (integrity protection)
// - resave: false → avoids saving session if unchanged (reduces overhead)
// - saveUninitialized: false → does not create session until something is stored (privacy + efficiency)
// - rolling: true → resets cookie expiry on every response (implements sliding/idle timeout)
// - Session data lifecycle managed via req.session (supports regenerate, destroy, etc.)
// ---------------------------------------------------------------
// Notes:
// - Cookie stores only a session ID → actual session data resides on server
// - Default store (MemoryStore) is not production-safe (no persistence, no scaling)
// - Recommended: use Redis or another external store in production
// - Fully compatible with Passport (supports req.session.regenerate / save)
// - Enables secure session lifecycle (prevents session fixation attacks)
app.use(cookieParser());
app.use(
    session({
        name: "to-session",
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,

        cookie: {
            // secure: ensures cookie is sent only over HTTPS in production
            // secure: runningOnProduction(),
            secure: false,

            // httpOnly: prevents client-side JS access (mitigates XSS)
            httpOnly: true,

            // sameSite: "lax" → basic CSRF protection while allowing top-level navigation
            sameSite: "lax",

            // maxAge: session expiration time (7d)
            // After expiry → cookie invalid → session considered expired
            maxAge: ms("7d"),
        },
    }),
);

// Middleware: Initializes Passport middleware
// - Attaches Passport to the request lifecycle
// - Adds helper methods: req.login(), req.logout(), req.isAuthenticated()
// - Does NOT persist login state (no session handling here)
app.use(passport.initialize());

// Middleware: Enables persistent login sessions (requires session middleware above)
// - Reads session data from the cookie
// - Calls passport.deserializeUser() on each request
// - Attaches the deserialized user to req.user
// - Maintains authentication state across requests
app.use(passport.session());

// Middleware: Loggs Incoming Requests
app.use(requestLogger);

// Server Home Route
app.get(
    "/",
    handleAsyncError(async function (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        res.status(HTTPSTATUSCODE.OK).json({
            message: "Welcome To TaskOrbit Server.",
        });
        return;
    }),
);

// Routes Middlewares
const BASE_PATH = config.BASE_PATH;
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, authProtect, userRoutes);
app.use(`${BASE_PATH}/workspace`, authProtect, workspaceRoutes);

// Middleware: Global error handler with env-based responses
// - Routes errors to dev or prod handlers based on environment
app.use(handleGlobalError);

// Starts HTTP server on configured PORT and logs environment details
app.listen(config.PORT, async function () {
    await connectDatabase("local");
    console.log(`🛜 Server: http://localhost:${config.PORT} [env:${config.NODE_ENV}]`);
});
