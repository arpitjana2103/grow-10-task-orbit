import { Router } from "express";

import { getCurrentUser } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.route("/current").get(getCurrentUser);

export default userRoutes;
