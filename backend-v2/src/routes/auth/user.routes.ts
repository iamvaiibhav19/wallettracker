import { Router } from "express";
import { getNetWorthSummary, onboardUser } from "../../controllers/auth/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Request OTP
router.post("/onboard", authenticate, onboardUser);

router.get("/net-worth", authenticate, getNetWorthSummary);

export default router;
