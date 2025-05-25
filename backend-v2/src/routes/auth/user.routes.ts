import { Router } from "express";
import { getDashboardOverview, getNetWorthSummary, getUserInfo, onboardUser } from "../../controllers/auth/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Request OTP
router.post("/onboard", authenticate, onboardUser);

// Get User Information
router.get("/me", authenticate, getUserInfo);

// Get Net Worth Summary
router.get("/net-worth", authenticate, getNetWorthSummary);

// Get Dashboard Overview metrics
router.get("/dashboard/overview", authenticate, getDashboardOverview);

export default router;
