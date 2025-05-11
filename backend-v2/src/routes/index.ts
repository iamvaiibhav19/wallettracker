import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./auth/user.routes";
import accountRoutes from "./account/account.routes";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// User routes
router.use("/user", authenticate, userRoutes);

// Account routes
router.use("/accounts", authenticate, accountRoutes);

export default router;
