import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./auth/user.routes";
import accountRoutes from "./account/account.routes";
import transactionRoutes from "./transaction/transaction.routes";
import categoryRoutes from "./category/category.routes";
import budgetRoutes from "./budget/budget.routes";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// User routes
router.use("/user", authenticate, userRoutes);

// Account routes
router.use("/accounts", authenticate, accountRoutes);

// Transaction routes
router.use("/transactions", authenticate, transactionRoutes);

// Category routes
router.use("/categories", authenticate, categoryRoutes);

// Budget routes
router.use("/budget", authenticate, budgetRoutes);

export default router;
