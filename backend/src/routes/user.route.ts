import { Router } from "express";

import { authProtect } from "../controllers/auth.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.use(authProtect);
userRoutes.route("/current").get(getCurrentUser);

export default userRoutes;
