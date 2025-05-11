import { Router } from "express";
import { requestOtp, validateToken, verifyOtp } from "../../controllers/auth/auth.controller";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth.middleware";

const router = Router();

// Request OTP
router.post("/request-otp", requestOtp);
// Verify OTP
router.post("/verify-otp", verifyOtp);
// Validate token
router.get("/protected", authenticate, validateToken);

export default router;
