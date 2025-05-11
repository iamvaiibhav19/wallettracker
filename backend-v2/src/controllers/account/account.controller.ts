import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import logger from "../../utils/logger";

/**
 * @swagger
 * /api/v2/accounts/create:
 *   post:
 *     summary: Create a new account for the user
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - balance
 *             properties:
 *               name:
 *                 type: string
 *                 example: HDFC Bank
 *               type:
 *                 type: string
 *                 example: bank
 *               balance:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export const createAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { name, type, balance } = req.body;

  if (!name || !type || balance === undefined) {
    logger.warn(`[CreateAccount] Missing fields | User: ${req.user?.email}`);
    return res
      .status(400)
      .json({ message: "Name, type, and balance are required" });
  }

  try {
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance,
        userId: req.user!.id,
      },
    });

    logger.info(
      `[CreateAccount] Success | User: ${req.user!.email} | Account ID: ${
        account.id
      }`
    );
    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (err: any) {
    logger.error(`[CreateAccount] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/accounts:
 *   get:
 *     summary: Get all accounts for the logged-in user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user accounts
 *       401:
 *         description: Unauthorized
 */
export const getAccounts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    logger.info(
      `[GetAccounts] Fetched ${accounts.length} accounts | User: ${
        req.user!.email
      }`
    );
    res.status(200).json({ accounts });
  } catch (err: any) {
    logger.error(`[GetAccounts] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * @swagger
 * /api/v2/accounts/{id}:
 *   get:
 *     summary: Get a single account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The account ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
export const getAccountById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const account = await prisma.account.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!account) {
      logger.warn(
        `[GetAccountById] Not found | ID: ${id} | User: ${req.user!.email}`
      );
      return res.status(404).json({ message: "Account not found" });
    }

    logger.info(
      `[GetAccountById] Success | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ account });
  } catch (err: any) {
    logger.error(`[GetAccountById] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/accounts/{id}:
 *   put:
 *     summary: Update an existing account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Account ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated HDFC Bank
 *               type:
 *                 type: string
 *                 example: bank
 *               balance:
 *                 type: number
 *                 example: 12000
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
export const updateAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, type, balance } = req.body;

  try {
    const result = await prisma.account.updateMany({
      where: { id, userId: req.user!.id },
      data: { name, type, balance },
    });

    if (result.count === 0) {
      logger.warn(
        `[UpdateAccount] Not found or unchanged | ID: ${id} | User: ${
          req.user!.email
        }`
      );
      return res
        .status(404)
        .json({ message: "Account not found or not updated" });
    }

    logger.info(
      `[UpdateAccount] Updated | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ message: "Account updated successfully" });
  } catch (err: any) {
    logger.error(`[UpdateAccount] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/accounts/{id}:
 *   delete:
 *     summary: Delete an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Account ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const result = await prisma.account.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (result.count === 0) {
      logger.warn(
        `[DeleteAccount] Not found | ID: ${id} | User: ${req.user!.email}`
      );
      return res.status(404).json({ message: "Account not found" });
    }

    logger.info(
      `[DeleteAccount] Deleted | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err: any) {
    logger.error(`[DeleteAccount] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
