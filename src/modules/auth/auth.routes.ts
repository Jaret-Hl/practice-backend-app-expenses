import { Router } from "express";
import { getProfile, loginUser, logoutUser, registerUser, refreshToken } from "./auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logoutUser);
router.get("/profile", authMiddleware, getProfile);

export default router;
