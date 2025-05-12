import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./auth/user.routes";
import accountRoutes from "./account/account.routes";
import { authenticate } from "../middlewares/auth.middleware";
import transactionRoutes from "./transaction/transaction.routes";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// User routes
router.use("/user", authenticate, userRoutes);

// Account routes
router.use("/accounts", authenticate, accountRoutes);

// Transaction routes
router.use("/transactions", authenticate, transactionRoutes);

export default router;
