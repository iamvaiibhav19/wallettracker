import { Router } from "express";
import { requestOtp, validateToken, verifyOtp } from "../../controllers/auth/auth.controller";
import { authenticate, AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { onboardUser } from "../../controllers/auth/user.controller";

const router = Router();

// Request OTP
router.post("/onboard", onboardUser);

export default router;
