import { Router } from "express";
import { getNetWorthSummary, getUserInfo, onboardUser } from "../../controllers/auth/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Request OTP
router.post("/onboard", authenticate, onboardUser);

// Get User Information
router.get("/me", authenticate, getUserInfo);

// Get Net Worth Summary
router.get("/net-worth", authenticate, getNetWorthSummary);

export default router;
