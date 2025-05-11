import { Request, Response } from "express";

import { Currency } from "../../constants/Currency";
import logger from "../../utils/logger";
import { prisma } from "../../models/prismaClient";
import { AuthenticatedRequest } from "middlewares/auth.middleware";

/**
 * @swagger
 * /api/v2/user/onboard:
 *   post:
 *     summary: Onboard a new user with currency and initial bank account
 *     description: Sets the preferred currency and adds the user's first bank account after login.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 description: Preferred currency
 *                 enum: [USD, EUR, INR, GBP, JPY, AUD, CAD, CNY]
 *                 example: INR
 *               bankName:
 *                 type: string
 *                 description: Name of the bank
 *                 example: HDFC Bank
 *               type:
 *                type: string
 *                description: Type of the account
 *                enum: [bank, cash]
 *               balance:
 *                 type: number
 *                 description: Initial balance in the account
 *                 example: 10000
 *     responses:
 *       200:
 *         description: User onboarded successfully
 *       400:
 *         description: Missing or invalid input fields
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
export const onboardUser = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { currency, bankName, balance, type } = req.body;

  const userId = req?.user?.id;

  if (!userId) {
    logger.warn("User ID not found in request");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info(`Onboarding attempt for userId: ${userId}`);

  // Input validation
  if (!currency || !bankName || balance === undefined) {
    logger.warn(`Missing fields during onboarding for userId: ${userId}`);
    return res.status(400).json({ message: "Currency, bank name, and balance are required" });
  }

  // Currency validation using enum
  if (!Object.values(Currency).includes(currency)) {
    logger.warn(`Invalid currency "${currency}" provided by userId: ${userId}`);
    return res.status(400).json({ message: "Invalid currency provided" });
  }

  try {
    logger.info(`Updating currency preference for userId: ${userId}`);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currency },
    });

    logger.info(`Creating bank account for userId: ${userId}`);
    const bankAccount = await prisma.account.create({
      data: {
        userId: user.id,
        name: bankName,
        type: type,
        balance,
      },
    });

    logger.info(`Onboarding successful for userId: ${userId}`);
    res.status(200).json({
      message: "User onboarded successfully",
      user,
      bankAccount,
    });
  } catch (err: any) {
    logger.error(`Onboarding failed for userId: ${userId} - ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
