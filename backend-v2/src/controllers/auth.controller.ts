import { Request, Response } from "express";

import { sendEmail } from "../utils/mailer";
import crypto from "crypto";
import { otpTemplate } from "../templates/otpTemplate";
import { prisma } from "../models/prismaClient";

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

  // 1. Input validation
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 2. Check if user exists, if not register the user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "",
      },
    });

    // 3. Randomly generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Expiration time for OTP - 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Store OTP for the user in the database
    await prisma.otp.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    // 6. Send OTP to user's email
    await sendEmail([email], "Your OTP Code", otpTemplate(code));

    // 7. Success response
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

  // 1. Input validation
  if (!email || !code) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    // 2. Check if user exists and retrieve OTP records
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otps: true },
    });

    if (!user) throw new Error("User not found");

    // 3. Find the OTP record that matches the code and is not expired
    const otpRecord = user.otps.find((otp: any) => otp.code === code && !otp.verified && otp.expiresAt > new Date());

    if (!otpRecord) throw new Error("Invalid or expired OTP");

    // 4. Mark OTP as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // 5. Generate a session token and keep it for 30 days
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 6. Store the session token in the database
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // 7. Success response with token
    res.status(200).json({
      message: "OTP verified successfully",
      token,
      expiresAt,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};
