import { Router } from "express";
import { onboardUser } from "../../controllers/auth/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Request OTP
router.post("/onboard", authenticate, onboardUser);

export default router;
