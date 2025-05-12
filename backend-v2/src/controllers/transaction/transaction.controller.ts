import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import logger from "../../utils/logger";
import { TransactionType } from "@prisma/client";

/**
 * @swagger
 * /api/v2/transactions/create:
 *   post:
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - accountId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               type:
 *                 type: string
 *                 enum:
 *                   - income
 *                   - expense
 *                   - transfer
 *                   - lend
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: Groceries
 *               description:
 *                 type: string
 *                 example: Monthly grocery shopping
 *               accountId:
 *                 type: string
 *                 example: "4f7c1b35-4c68-4e3d-8129-50884a1bfb02"
 *               destinationAccountId:
 *                 type: string
 *                 example: "9d1e2a53-8d8b-4c87-b874-308c99999a4d"
 *                 description: The ID of the destination account (required for transfer type)
 *               targetName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: The name of the person (used for lend type)
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-01T00:00:00.000Z"
 *                 description: The reminder date for lend type transactions
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction created successfully
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b835ddfe-d83c-4c16-953f-0c67cc928dd3"
 *                     amount:
 *                       type: number
 *                       example: 500
 *                     type:
 *                       type: string
 *                       example: expense
 *                     category:
 *                       type: string
 *                       example: Groceries
 *                     description:
 *                       type: string
 *                       example: Monthly grocery shopping
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-01T10:00:00.000Z"
 *                     accountId:
 *                       type: string
 *                       example: "4f7c1b35-4c68-4e3d-8129-50884a1bfb02"
 *                     destinationAccountId:
 *                       type: string
 *                       example: "9d1e2a53-8d8b-4c87-b874-308c99999a4d"
 *                     targetName:
 *                       type: string
 *                       example: "John Doe"
 *                     reminderDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-01T00:00:00.000Z"
 *       400:
 *         description: Invalid input, missing required fields, or insufficient balance
 *       404:
 *         description: Account not found or destination account not found
 *       500:
 *         description: Internal server error
 */

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { amount, type, categoryId, description, accountId, destinationAccountId, targetName, reminderDate } = req.body;

  try {
    let updatedAccountBalance: number | null = null;
    let updatedDestinationBalance: number | null = null;

    // Case 1: Income transaction
    if (type === TransactionType.income) {
      logger.info(`[CreateTransaction] Income transaction detected | User: ${req.user!.email}`);
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        logger.warn(`[CreateTransaction] Provided account for income not found: ${accountId}`);
        return res.status(404).json({ message: "Account not found" });
      }

      updatedAccountBalance = account.balance + amount;
    }

    // Case 2: Expense | Transfer | Lend transaction
    if (type === TransactionType.expense || type === TransactionType.transfer || type === TransactionType.lend) {
      logger.info(`[CreateTransaction] ${type} transaction detected | User: ${req.user!.email}`);

      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        logger.warn(`[CreateTransaction] Provided account for ${type} not found: ${accountId}`);
        return res.status(404).json({ message: "Account not found" });
      }

      // Ensure sufficient balance for expense/transfer
      if (account.balance < amount) {
        logger.warn(
          `[CreateTransaction] Insufficient balance for transaction | User: ${req.user!.email} | Account: ${accountId} | Amount: ${amount}`
        );
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct balance from source account
      updatedAccountBalance = account.balance - amount;
    }

    // If it's a transfer, update the destination account as well
    if (type === TransactionType.transfer && destinationAccountId) {
      logger.info(`[CreateTransaction] Transfer transaction detected | User: ${req.user!.email}`);
      const destinationAccount = await prisma.account.findUnique({
        where: { id: destinationAccountId },
      });

      if (!destinationAccount) {
        logger.warn(`[CreateTransaction] Destination account not found: ${destinationAccountId}`);
        return res.status(404).json({ message: "Destination account not found" });
      }

      updatedDestinationBalance = destinationAccount.balance + amount;
    }

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        categoryId,
        description,
        date: new Date(),
        accountId,
        userId: req.user!.id,
        targetName,
        reminderDate,
        ...(type === TransactionType.transfer && { destinationAccountId }),
      },
    });

    // Update account balances if necessary
    if (updatedAccountBalance !== null) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: updatedAccountBalance },
      });
    }

    // Update destination account balance if it's a transfer
    if (updatedDestinationBalance !== null) {
      await prisma.account.update({
        where: { id: destinationAccountId },
        data: { balance: updatedDestinationBalance },
      });
    }

    logger.info(`[CreateTransaction] Created transaction: ${transaction.id} | User: ${req.user!.email} | Amount: ${amount} | Type: ${type}`);

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (err: any) {
    logger.error(`Error creating transaction: ${err.message}`);
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
export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: "desc" },
    });

    logger.info(`[GetTransactions] Fetched ${transactions.length} transactions | User: ${req.user!.email}`);

    res.status(200).json({ transactions });
  } catch (err: any) {
    logger.error(`[GetTransactions] Error: ${err.message} | User: ${req.user?.email}`);
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
export const getTransactionById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!transaction) {
      logger.warn(`[GetTransactionById] Not found | ID: ${id} | User: ${req.user!.email}`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(`[GetTransactionById] Found | ID: ${id} | User: ${req.user!.email}`);
    res.status(200).json({ transaction });
  } catch (err: any) {
    logger.error(`[GetTransactionById] Error: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The transaction ID
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
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer, lend]
 *                 example: transfer
 *               category:
 *                 type: string
 *                 example: salary
 *               description:
 *                 type: string
 *                 example: Monthly Salary
 *               accountId:
 *                 type: string
 *                 example: "account-id-123"
 *               destinationAccountId:
 *                 type: string
 *                 example: "account-id-456"
 *               targetName:
 *                 type: string
 *                 example: "John Doe"
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-01T00:00:00Z"
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { amount, type, categoryId, description, accountId, destinationAccountId, targetName, reminderDate } = req.body;

  try {
    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      logger.warn(`Transaction not found: ${id}`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Initialize updated balances
    let updatedAccountBalance: number | null = null;
    let updatedDestinationBalance: number | null = null;

    // If the transaction is not income, we need to update the source account balance
    if (type !== TransactionType.income) {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        logger.warn(`Account not found: ${accountId}`);
        return res.status(404).json({ message: "Account not found" });
      }

      // Ensure sufficient balance for expense/transfer
      if (account.balance < amount) {
        logger.warn(`Insufficient balance in account: ${accountId}`);
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct balance from the source account
      updatedAccountBalance = account.balance - amount;
    }

    // Handle transfer case if the transaction type is 'transfer'
    if (type === TransactionType.transfer && destinationAccountId) {
      const destinationAccount = await prisma.account.findUnique({
        where: { id: destinationAccountId },
      });

      if (!destinationAccount) {
        logger.warn(`Destination account not found: ${destinationAccountId}`);
        return res.status(404).json({ message: "Destination account not found" });
      }

      updatedDestinationBalance = destinationAccount.balance + amount;
    }

    // Update the transaction in the database
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        categoryId,
        description,
        targetName,
        reminderDate,
        ...(type === TransactionType.transfer && { destinationAccountId }), // For transfers
      },
    });

    // Update the source account balance
    if (updatedAccountBalance !== null) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: updatedAccountBalance },
      });
    }

    // Update the destination account balance if it's a transfer
    if (updatedDestinationBalance !== null) {
      await prisma.account.update({
        where: { id: destinationAccountId },
        data: { balance: updatedDestinationBalance },
      });
    }

    // Log the successful update
    logger.info(`[UpdateTransaction] Updated transaction: ${updatedTransaction.id} | User: ${req.user!.email} | Amount: ${amount} | Type: ${type}`);

    // Respond with the updated transaction
    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (err: any) {
    logger.error(`Error updating transaction: ${err.message}`);
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
export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params; // Get the transaction id from the route params

  try {
    // First, find the transaction to get necessary details (like amount, accountId, and destinationAccountId)
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      logger.warn(`[DeleteTransaction] Transaction not found | ID: ${id} | User: ${req.user!.email}`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update the balance based on transaction type (income, expense, transfer, lend)
    let updatedAccountBalance: number | null = null;
    let updatedDestinationBalance: number | null = null;

    // Handle balance update for the source account (accountId)
    const account = await prisma.account.findUnique({
      where: { id: transaction.accountId },
    });

    if (account) {
      // For income, deduct it back
      if (transaction.type === "income") {
        updatedAccountBalance = account.balance - transaction.amount;
      }
      // For expense, transfer, or lend, add it back
      else if (transaction.type === "expense" || transaction.type === "transfer" || transaction.type === "lend") {
        updatedAccountBalance = account.balance + transaction.amount;
      }

      if (updatedAccountBalance !== null) {
        // Update the source account balance
        await prisma.account.update({
          where: { id: account.id },
          data: { balance: updatedAccountBalance },
        });
      }
    }

    // Handle balance update for the destination account (destinationAccountId) if it's a transfer
    if (transaction.type === "transfer" && transaction.destinationAccountId) {
      const destinationAccount = await prisma.account.findUnique({
        where: { id: transaction.destinationAccountId },
      });

      if (destinationAccount) {
        updatedDestinationBalance = destinationAccount.balance - transaction.amount;
        // Update the destination account balance
        await prisma.account.update({
          where: { id: destinationAccount.id },
          data: { balance: updatedDestinationBalance },
        });
      }
    }

    // Now, delete the transaction
    await prisma.transaction.delete({
      where: { id },
    });

    // Log the deletion
    logger.info(`[DeleteTransaction] Deleted | ID: ${id} | User: ${req.user!.email}`);

    // Return success response
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err: any) {
    // Catch any errors and log them
    logger.error(`[DeleteTransaction] Error: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/delete/multiple:
 *   post:
 *     summary: Delete multiple transactions and update the account balances
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["transaction-id-1", "transaction-id-2"]
 *     responses:
 *       200:
 *         description: Multiple transactions deleted successfully and account balances updated
 *       400:
 *         description: No transaction IDs provided or invalid format
 *       404:
 *         description: No transactions found for the provided IDs
 *       500:
 *         description: Internal server error
 */

export const deleteTransactions = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { ids } = req.body; // Expecting an array of transaction IDs to delete

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No transaction IDs provided" });
  }

  try {
    // Fetch the transactions by their IDs to check their details
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for the provided IDs" });
    }

    // Loop through each transaction and update the corresponding account balances
    for (const transaction of transactions) {
      let updatedAccountBalance: number | null = null;
      let updatedDestinationBalance: number | null = null;

      // Update the balance of the source account (accountId)
      const account = await prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      if (account) {
        // Handle different transaction types
        if (transaction.type === "income") {
          updatedAccountBalance = account.balance - transaction.amount;
        } else if (transaction.type === "expense" || transaction.type === "transfer") {
          updatedAccountBalance = account.balance + transaction.amount;
        } else if (transaction.type === "lend") {
          updatedAccountBalance = account.balance + transaction.amount;
        }

        if (updatedAccountBalance !== null) {
          await prisma.account.update({
            where: { id: account.id },
            data: { balance: updatedAccountBalance },
          });
        }
      }

      // If it's a transfer, update the destination account as well
      if (transaction.type === "transfer" && transaction.destinationAccountId) {
        const destinationAccount = await prisma.account.findUnique({
          where: { id: transaction.destinationAccountId },
        });

        if (destinationAccount) {
          updatedDestinationBalance = destinationAccount.balance - transaction.amount;
          await prisma.account.update({
            where: { id: destinationAccount.id },
            data: { balance: updatedDestinationBalance },
          });
        }
      }
    }

    // Delete all the transactions in the array of IDs
    await prisma.transaction.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    logger.info(`[DeleteTransactions] Deleted multiple transactions | User: ${req.user!.email}`);

    res.status(200).json({ message: "Transactions deleted successfully" });
  } catch (err: any) {
    logger.error(`[DeleteTransactions] Error: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/transactions/delete-all:
 *   delete:
 *     summary: Delete all transactions for the user and update the account balances
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: All transactions deleted successfully and account balances updated
 *       404:
 *         description: No transactions found for the user
 *       500:
 *         description: Internal server error
 */
export const deleteAllTransactions = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    // Fetch all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for the user" });
    }

    // Loop through each transaction to update the corresponding account balances
    for (const transaction of transactions) {
      let updatedAccountBalance: number | null = null;
      let updatedDestinationBalance: number | null = null;

      // Update the balance of the source account (accountId)
      const account = await prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      if (account) {
        // Handle different transaction types
        if (transaction.type === "income") {
          updatedAccountBalance = account.balance - transaction.amount;
        } else if (transaction.type === "expense" || transaction.type === "transfer") {
          updatedAccountBalance = account.balance + transaction.amount;
        } else if (transaction.type === "lend") {
          updatedAccountBalance = account.balance + transaction.amount;
        }

        if (updatedAccountBalance !== null) {
          await prisma.account.update({
            where: { id: account.id },
            data: { balance: updatedAccountBalance },
          });
        }
      }

      // If it's a transfer, update the destination account as well
      if (transaction.type === "transfer" && transaction.destinationAccountId) {
        const destinationAccount = await prisma.account.findUnique({
          where: { id: transaction.destinationAccountId },
        });

        if (destinationAccount) {
          updatedDestinationBalance = destinationAccount.balance - transaction.amount;
          await prisma.account.update({
            where: { id: destinationAccount.id },
            data: { balance: updatedDestinationBalance },
          });
        }
      }
    }

    // Delete all transactions for the user
    await prisma.transaction.deleteMany({
      where: {
        userId: req.user!.id,
      },
    });

    logger.info(`[DeleteAllTransactions] Deleted all transactions | User: ${req.user!.email}`);

    res.status(200).json({ message: "All transactions deleted successfully" });
  } catch (err: any) {
    logger.error(`[DeleteAllTransactions] Error: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
