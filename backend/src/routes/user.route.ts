import { Router } from "express";

import { getCurrentUser } from "../controllers/user.controller.js";
import { authProtect } from "../middlewares/auth.middleware.js";

const userRoutes = Router();

userRoutes.use(authProtect);
userRoutes.route("/current").get(getCurrentUser);

export default userRoutes;
