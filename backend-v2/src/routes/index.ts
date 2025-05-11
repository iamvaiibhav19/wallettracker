import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Mount all route modules here
router.use("/auth", authRoutes);

export default router;
