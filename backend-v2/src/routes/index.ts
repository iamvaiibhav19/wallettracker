import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./auth/user.routes";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// User routes
router.use("/user", authenticate, userRoutes);

export default router;
