import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import logger from "../../utils/logger";
import { exportToExcel } from "../../utils/export/exportToExcel";
import { accountExportColumns } from "../../utils/export/columns/accountExportColumns";

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
export const createAccount = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name, type, balance } = req.body;

  if (!name || !type || balance === undefined) {
    logger.warn(`[CreateAccount] Missing fields | User: ${req.user?.email}`);
    return res.status(400).json({ message: "Name, type, and balance are required" });
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

    logger.info(`[CreateAccount] Success | User: ${req.user!.email} | Account ID: ${account.id}`);
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "Page number for pagination (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: "Number of accounts per page (default: 20, max: 100)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter accounts created on or after this date (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter accounts created on or before this date (YYYY-MM-DD)"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Search term to filter accounts by name (case-insensitive)"
 *       - in: query
 *         name: isExport
 *         schema:
 *           type: boolean
 *           default: false
 *         description: "If true, exports the accounts as an Excel file (no pagination)"
 *     responses:
 *       200:
 *         description: "List of user accounts or exported file"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: "Total number of matching accounts"
 *                     page:
 *                       type: integer
 *                       description: "Current page number"
 *                     limit:
 *                       type: integer
 *                       description: "Number of accounts per page"
 *                     totalPages:
 *                       type: integer
 *                       description: "Total pages available"
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *             description: "Excel file export of accounts"
 *       401:
 *         description: "Unauthorized - user not authenticated"
 *       500:
 *         description: "Internal server error"
 *
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "Account ID"
 *         userId:
 *           type: string
 *           description: "Owner user ID"
 *         name:
 *           type: string
 *           description: "Account name"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "Account creation timestamp"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "Last account update timestamp"
 */
export const getAccounts = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Destructure query params
    const { page: pageRaw, limit: limitRaw, startDate, endDate, search, isExport = false } = req.query as any;

    // Parse pagination
    const page = Math.max(1, parseInt(pageRaw as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw as string) || 20));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const filters: any = { userId };

    // Optional date filters (assuming `createdAt` field exists on accounts)
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) filters.createdAt.lte = new Date(endDate);
    }

    // Optional search filter (assuming searching by `name` field of account)
    if (search && typeof search === "string") {
      filters.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (isExport === "true") {
      // Simulate 1 second delay for export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const accounts = await prisma.account.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
      });

      // Replace these with your actual export logic and columns
      const buffer = await exportToExcel(accounts, accountExportColumns, "accounts");

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=accounts.xlsx");
      return res.send(buffer);
    }

    // Count total filtered accounts
    const total = await prisma.account.count({ where: filters });

    // Fetch filtered and paginated accounts
    const accounts = await prisma.account.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    logger.info(`[GetAccounts] User: ${req.user!.email} | Page: ${page} | Limit: ${limit} | Returned: ${accounts.length}`);

    res.status(200).json({
      accounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    logger.error(`[GetAccounts] Error fetching accounts: ${err.message} | User: ${req.user!.email}`);
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
export const getAccountById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const account = await prisma.account.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!account) {
      logger.warn(`[GetAccountById] Not found | ID: ${id} | User: ${req.user!.email}`);
      return res.status(404).json({ message: "Account not found" });
    }

    logger.info(`[GetAccountById] Success | ID: ${id} | User: ${req.user!.email}`);
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
export const updateAccount = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, type, balance } = req.body;

  try {
    const result = await prisma.account.updateMany({
      where: { id, userId: req.user!.id },
      data: { name, type, balance },
    });

    if (result.count === 0) {
      logger.warn(`[UpdateAccount] Not found or unchanged | ID: ${id} | User: ${req.user!.email}`);
      return res.status(404).json({ message: "Account not found or not updated" });
    }

    logger.info(`[UpdateAccount] Updated | ID: ${id} | User: ${req.user!.email}`);
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
export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const result = await prisma.account.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (result.count === 0) {
      logger.warn(`[DeleteAccount] Not found | ID: ${id} | User: ${req.user!.email}`);
      return res.status(404).json({ message: "Account not found" });
    }

    logger.info(`[DeleteAccount] Deleted | ID: ${id} | User: ${req.user!.email}`);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err: any) {
    logger.error(`[DeleteAccount] DB Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
