import type { Request } from "express";
import type { Profile } from "passport";
import type { VerifyCallback } from "passport-google-oauth2";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

import { AccountProviderEnum } from "../enums/account-provider.enum.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import UserModel from "../models/user.model.js";
import { ensureUser } from "../services/auth.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { config } from "./app.config.js";
import { HTTPSTATUSCODE } from "./http.config.js";
import { logger } from "./logger.config.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.get_BACKEND_GOOGLE_CALLBACK_URL(),
            scope: ["profile", "email"],
            passReqToCallback: true,
        },
        async function googleVerifyCallback(
            req: Request,
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback,
        ) {
            try {
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const picture = profile.photos?.[0]?.value || "";

                if (!email)
                    throw new AppError({
                        internalMessage: "Google profile missing email",
                        publicMessage: "Authentication failed. Email not available.",
                        statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
                        errorCode: ErrorCodeEnum.AUTH_NOT_FOUND,
                    });

                const user = await ensureUser({
                    provider: AccountProviderEnum.GOOGLE,
                    name: profile.displayName,
                    providerId: googleId,
                    picture: picture,
                    email: email,
                });
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        },
    ),
);

passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async function (userId: string, done) {
    const user = await UserModel.findById(userId);
    done(null, user);
});

/*
Step 15: Next Request (deserializeUser)

    - Browser automatically sends cookie:
        Cookie: to-session=SESSION_ID

    - express-session middleware:
        - Reads SESSION_ID from cookie
        - Looks up session in store (Memory / Redis)
        - Attaches to req.session

        req.session = {
            passport: { user: "USER_ID" }
        }

    - passport.session():
        - Extracts: req.session.passport.user
        - Calls: deserializeUser(USER_ID, done)

    - deserializeUser():
        - Fetch user from DB
        - done(null, user)

    - Passport attaches:
        req.user = user

    - Authenticated Controller have -
            - req.user              // ✅ full user
            - req.isAuthenticated() // ✅ true
            - req.session           // ✅ contains passport.user (USER_ID)
*/
