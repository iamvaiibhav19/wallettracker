import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import logger from "../../utils/logger";
import { prisma } from "../../models/prismaClient";

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
 *     summary: Get all categories for the user
 *     tags:
 *       - [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ categories });
  } catch (err: any) {
    logger.error(`Error fetching categories: ${err.message} | User: ${req.user!.email}`);
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
