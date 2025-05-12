import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import logger from "../../utils/logger";

/**
 * @swagger
 * /api/v2/transactions/create:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *               - accountId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer, investment]
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: groceries
 *               description:
 *                 type: string
 *                 example: Weekly grocery shopping
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-05-11T12:00:00.000Z
 *               accountId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { amount, type, category, description, date, accountId } = req.body;

  if (amount === undefined || !type || !category || !date || !accountId) {
    logger.warn(
      `[CreateTransaction] Missing required fields | User: ${req.user?.email}`
    );
    return res.status(400).json({
      message: "Amount, type, category, date, and accountId are required",
    });
  }

  const validTypes = ["income", "expense", "transfer", "investment"];
  if (!validTypes.includes(type)) {
    logger.warn(
      `[CreateTransaction] Invalid transaction type: ${type} | User: ${req.user?.email}`
    );
    return res.status(400).json({ message: "Invalid transaction type" });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        category,
        description,
        date: new Date(date),
        accountId,
        userId: req.user!.id,
      },
    });

    logger.info(
      `[CreateTransaction] Created transaction ${
        transaction.id
      } | Amount: ${amount} | Type: ${type} | User: ${req.user!.email}`
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (err: any) {
    logger.error(
      `[CreateTransaction] Error: ${err.message} | User: ${req.user?.email}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions:
 *   get:
 *     summary: Get all transactions for the logged-in user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user transactions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: "desc" },
    });

    logger.info(
      `[GetTransactions] Fetched ${transactions.length} transactions | User: ${
        req.user!.email
      }`
    );

    res.status(200).json({ transactions });
  } catch (err: any) {
    logger.error(
      `[GetTransactions] Error: ${err.message} | User: ${req.user?.email}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   get:
 *     summary: Get a single transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The transaction ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
export const getTransactionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!transaction) {
      logger.warn(
        `[GetTransactionById] Not found | ID: ${id} | User: ${req.user!.email}`
      );
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(
      `[GetTransactionById] Found | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ transaction });
  } catch (err: any) {
    logger.error(
      `[GetTransactionById] Error: ${err.message} | User: ${req.user!.email}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Transaction ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               accountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { amount, type, category, description, date, accountId } = req.body;

  try {
    const updated = await prisma.transaction.updateMany({
      where: { id, userId: req.user!.id },
      data: { amount, type, category, description, date, accountId },
    });

    if (updated.count === 0) {
      logger.warn(
        `[UpdateTransaction] Not found | ID: ${id} | User: ${req.user!.email}`
      );
      return res
        .status(404)
        .json({ message: "Transaction not found or not updated" });
    }

    logger.info(
      `[UpdateTransaction] Updated | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (err: any) {
    logger.error(
      `[UpdateTransaction] Error: ${err.message} | User: ${req.user!.email}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Transaction ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const deleted = await prisma.transaction.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (deleted.count === 0) {
      logger.warn(
        `[DeleteTransaction] Not found | ID: ${id} | User: ${req.user!.email}`
      );
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(
      `[DeleteTransaction] Deleted | ID: ${id} | User: ${req.user!.email}`
    );
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err: any) {
    logger.error(
      `[DeleteTransaction] Error: ${err.message} | User: ${req.user!.email}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};
