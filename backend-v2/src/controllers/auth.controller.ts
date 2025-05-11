import { Request, Response } from "express";

import { sendEmail } from "../utils/mailer";
import crypto from "crypto";
import { otpTemplate } from "../templates/otpTemplate";
import { prisma } from "../models/prismaClient";
import logger from "../utils/logger";

/**
 * @swagger
 * /api/v2/auth/request-otp:
 *   post:
 *     summary: Request OTP to authenticate user
 *     description: Sends an OTP to the user's email for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to send the OTP to
 *                 example: vaibhavmagar1901@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request, email is required
 *       500:
 *         description: Internal server error
 */
export const requestOtp = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 2. Check if user exists, if not register the user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: "" },
    });

    // Check OTP request count in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentOtps = await prisma.otp.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: tenMinutesAgo,
        },
      },
    });

    logger.info(`OTP request count in the last 10 minutes for ${email}: ${recentOtps}`);

    if (recentOtps >= 5) {
      logger.warn(`Too many OTP requests for ${email}. Rate limit exceeded.`);
      return res.status(429).json({
        message: "Too many OTP requests. Please wait 10 minutes before trying again.",
      });
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 5 min

    // Save OTP
    await prisma.otp.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    logger.info(`Generated OTP for ${email}: ${code}`);

    // Send OTP email
    await sendEmail([email], "Your OTP Code", otpTemplate(code));

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v2/auth/verify-otp:
 *   post:
 *     summary: Verify OTP to authenticate user
 *     description: Verifies the OTP sent to the user's email and generates a session token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: vaibhavmagar1901@gmail.com
 *               code:
 *                 type: string
 *                 description: The OTP code sent to the user's email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully and session token generated
 *       400:
 *         description: Bad request, email and OTP are required
 *       401:
 *         description: Invalid or expired OTP
 */
export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  const { email, code } = req.body;

  logger.info(`Verifying OTP for email: ${email}`);

  // 1. Input validation
  if (!email || !code) {
    logger.warn("Missing email or OTP code in request");
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // 2. Find user with OTPs
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otps: true },
    });

    if (!user) {
      logger.warn(`User not found for email: ${email}`);
      throw new Error("User not found");
    }

    // 3. Find matching and valid OTP
    const otpRecord = user.otps.find((otp: any) => otp.code === code && !otp.verified && otp.expiresAt > new Date());

    if (!otpRecord) {
      logger.warn(`Invalid or expired OTP entered for email: ${email}`);
      throw new Error("Invalid or expired OTP");
    }

    // 4. Mark OTP as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
    logger.info(`OTP verified successfully for email: ${email}`);

    // 5. Clean up old OTPs
    const deletedOtps = await prisma.otp.deleteMany({
      where: {
        userId: user.id,
        id: { not: otpRecord.id },
      },
    });
    logger.info(`Cleaned up ${deletedOtps.count} old OTPs for user: ${email}`);

    // 6. Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
    logger.info(`Session token created for user: ${email}`);

    // 7. Respond with token
    res.status(200).json({
      message: "OTP verified successfully",
      token,
      expiresAt,
    });
  } catch (err: any) {
    logger.error(`OTP verification failed for ${email}: ${err.message}`);
    res.status(401).json({ error: err.message });
  }
};
