import { Router } from "express";
import { requestOtp, verifyOtp } from "../controllers/auth.controller";

const router = Router();

// Request OTP
router.post("/request-otp", requestOtp);
// Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
