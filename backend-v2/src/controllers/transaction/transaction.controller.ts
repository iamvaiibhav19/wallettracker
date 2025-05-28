import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import logger from "../../utils/logger";
import { TransactionType } from "@prisma/client";
import { transactionExportColumns } from "../../utils/export/columns/transactionColumns";
import { exportToExcel } from "../../utils/export/exportToExcel";

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
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-01T10:00:00.000Z"
 *                 description: The date/time of the transaction (optional)
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
 *               categoryId:
 *                 type: string
 *                 example: "4f7c1b35-4c68-4e3d-8129-50884a1bfb02"
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
 *                     categoryId:
 *                       type: string
 *                       example: "4f7c1b35-4c68-4e3d-8129-50884a1bfb02"
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
  const { amount, type, categoryId, description, accountId, destinationAccountId, targetName, reminderDate, date } = req.body;

  try {
    let updatedAccountBalance: number | null = null;
    let updatedDestinationBalance: number | null = null;

    const transactionDate = date ? new Date(date) : new Date();

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
        date: transactionDate,
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
 *     summary: Get transactions for the logged-in user with filters, pagination, and export option
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of transactions per page (optional)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions from this date (inclusive) (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions up to this date (inclusive) (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text applied to description, category name, target name, or exact amount (optional)
 *       - in: query
 *         name: isExport
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, exports all matching transactions as an Excel file (optional)
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *           properties:
 *             category:
 *               type: string
 *               description: Filter by transaction category (optional)
 *             minAmount:
 *               type: number
 *               format: float
 *               description: Filter by minimum transaction amount (optional)
 *             maxAmount:
 *               type: number
 *               format: float
 *               description: Filter by maximum transaction amount (optional)
 *         style: deepObject
 *         explode: true
 *         description: Additional filters as an object (optional)
 *     responses:
 *       200:
 *         description: List of transactions with pagination info or Excel file when exporting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "txn_123abc"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-05-20T14:48:00.000Z"
 *                       description:
 *                         type: string
 *                         example: "Grocery Shopping"
 *                       amount:
 *                         type: number
 *                         format: float
 *                         example: 45.67
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Food"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Destructure query params
    const { page: pageRaw, limit: limitRaw, startDate, endDate, search, isExport, minAmount, maxAmount, category } = req.query as any;

    console.log(req.query, "query params");

    // Parse pagination
    const page = Math.max(1, parseInt(pageRaw as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw as string) || 20));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const filters: any = { userId };

    // Optional date filters
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate);
      if (endDate) filters.date.lte = new Date(endDate);
    }

    // Filters from payload - category as multiple IDs
    let categoryIds: number[] | undefined;

    if (category) {
      console.log(category, "category filter");
      if (Array.isArray(category)) {
        console.log("Category is an array");
        categoryIds = category.map((id) => Number(id)).filter(Boolean);
      } else if (typeof category === "string") {
        console.log("Category is a string");
        categoryIds = category.split(",") as any;
      } else {
        console.log(typeof category, "category type is not string or array");
      }
    }

    console.log(categoryIds, "categoryIds");

    if (categoryIds && categoryIds.length > 0) {
      filters.categoryId = { in: categoryIds };
    }

    if (minAmount || maxAmount) {
      filters.amount = {};
      if (minAmount) filters.amount.gte = Number(minAmount);
      if (maxAmount) filters.amount.lte = Number(maxAmount);
    }

    // Search filter (across multiple fields)
    if (search) {
      const searchStr = search as string;
      filters.OR = [
        { description: { contains: searchStr, mode: "insensitive" } },
        { category: { name: { contains: searchStr, mode: "insensitive" } } },
        !isNaN(Number(searchStr)) ? { amount: Number(searchStr) } : undefined,
        { targetName: { contains: searchStr, mode: "insensitive" } },
      ].filter(Boolean);
    }

    console.log(filters, "filters");

    // Export as Excel
    if (isExport === "true") {
      const transactions = await prisma.transaction.findMany({
        where: filters,
        orderBy: { date: "desc" },
        include: { category: true },
      });

      const buffer = await exportToExcel(transactions, transactionExportColumns, "Transactions");

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");
      return res.send(buffer);
    }

    // Pagination & fetch
    const total = await prisma.transaction.count({ where: filters });

    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: {
        category: true,
      },
    });

    logger.info(`[GetTransactions] User: ${req.user!.email} | Page: ${page} | Limit: ${limit} | Returned: ${transactions.length}`);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
 * /api/v2/transactions/delete/all:
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

/**
 * @swagger
 * /api/v2/transactions/heatmap:
 *   get:
 *     summary: Get daily transaction counts for heatmap
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, transfer, lend]
 *         required: false
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Daily transaction counts for heatmap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export const getTransactionHeatmap = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { startDate, endDate, type, categoryId, accountId } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;

    const heatmapData = await prisma.transaction.groupBy({
      by: ["date"],
      _count: { id: true },
      where,
      orderBy: { date: "asc" },
    });

    const result = heatmapData.map(({ date, _count }) => ({
      date: date.toISOString().split("T")[0],
      count: _count.id,
    }));

    logger.info(`[Heatmap] Returned ${result.length} entries for user ${req.user!.email}`);
    return res.json({ data: result });
  } catch (err: any) {
    logger.error(`[Heatmap] Error: ${err.message} | User: ${req.user?.email}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
