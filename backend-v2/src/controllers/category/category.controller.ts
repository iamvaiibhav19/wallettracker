import { Response } from "express";
import { exportToExcel } from "../../utils/export/exportToExcel";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";
import { categoryExportColumns } from "../../utils/export/columns/categoryExportColumns";
import logger from "../../utils/logger";

/**
 * @swagger
 * /api/v2/categories/create:
 *   post:
 *     summary: Create a new category for the user
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Salary
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // validate if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: req.user!.id,
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId: req.user!.id,
      },
    });

    res.status(201).json({ message: "Category created successfully", category });
  } catch (err: any) {
    logger.error(`Error creating category: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/categories/{id}:
 *   put:
 *     summary: Update a category for the user
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
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
 *                 example: Freelance Income
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // check if category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = await prisma.category.update({
      where: { id, userId: req.user!.id },
      data: { name },
    });

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (err: any) {
    logger.error(`Error updating category: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/categories/{id}:
 *   delete:
 *     summary: Delete a category for the user
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    // Check ownership
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({ message: "Category deleted successfully. Related transactions are now uncategorized." });
  } catch (err: any) {
    console.error(`[DeleteCategory] Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/categories:
 *   get:
 *     summary: Get all categories for the user with optional pagination, date, and search filters
 *     tags:
 *       - [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of categories per page (max 100)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter categories created from this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter categories created up to this date (inclusive)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search keyword to filter category names
 *     responses:
 *       200:
 *         description: List of categories with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of categories
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of categories per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Destructure query params
    const { page: pageRaw, limit: limitRaw, startDate, endDate, search, isExport = false } = req.query as any;

    // Parse pagination
    const page = Math.max(1, parseInt(pageRaw as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw as string) || 20));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const filters: any = {
      userId,
    };

    // Optional date filters
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) filters.createdAt.lte = new Date(endDate);
    }

    // Optional search filter
    if (search && typeof search === "string") {
      filters.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Export as Excel
    if (isExport === "true") {
      // simulate 1 second delay for export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const categories = await prisma.category.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
      });

      const buffer = await exportToExcel(categories, categoryExportColumns, "categories");

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");
      return res.send(buffer);
    }

    // Count total filtered categories
    const total = await prisma.category.count({ where: filters });

    // Fetch filtered and paginated categories
    const categories = await prisma.category.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    logger.info(`[GetCategories] User: ${req.user!.email} | Page: ${page} | Limit: ${limit} | Returned: ${categories.length}`);

    res.status(200).json({
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    logger.error(`[GetCategories] Error fetching categories: ${err.message} | User: ${req.user!.email}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/categories/{categoryId}/transactions:
 *   get:
 *     summary: Get transactions by category with optional date range and pagination
 *     tags:
 *       - [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: The category ID for filtering transactions
 *         schema:
 *           type: string
 *           example: "12345"  # Example category ID
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: The start date to filter transactions
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-01-01"
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: The end date to filter transactions
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination (default is 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of results per page (default is 10)
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of transactions in the specified category
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
 *                       id:
 *                         type: string
 *                         example: "b835ddfe-d83c-4c16-953f-0c67cc928dd3"
 *                       amount:
 *                         type: number
 *                         example: 500
 *                       type:
 *                         type: string
 *                         example: expense
 *                       categoryId:
 *                         type: string
 *                         example: "12345"
 *                       description:
 *                         type: string
 *                         example: "Monthly grocery shopping"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-06-01T10:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: No transactions found in the specified category
 *       500:
 *         description: Internal server error
 */

export const getTransactionsByCategory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { categoryId } = req.params;
  const { startDate, endDate, page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * pageSize;

  const filters: any = {
    userId: req.user!.id,
    categoryId,
  };

  if (startDate && endDate) {
    filters.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: {
        date: "desc",
      },
      skip,
      take: pageSize,
    });

    const total = await prisma.transaction.count({ where: filters });

    res.status(200).json({
      data: transactions,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    console.error(`[GetTransactionsByCategory] Error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
