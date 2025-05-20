import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import logger from "../../utils/logger";
import { prisma } from "../../models/prismaClient";

/**
 * @swagger
 * /api/v2/budgets:
 *   post:
 *     summary: Create a new budget for a category
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, limit, startDate, endDate]
 *             properties:
 *               categoryId:
 *                 type: string
 *               limit:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Budget created
 *       400:
 *         description: Invalid input or duplicate
 *       500:
 *         description: Internal error
 */
export const createBudget = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { categoryId, limit, startDate, endDate } = req.body;

  if (!categoryId || !limit || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Prevent duplicates
    const existing = await prisma.budget.findFirst({
      where: {
        userId: req.user!.id,
        categoryId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Budget for this period already exists." });
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.user!.id,
        categoryId,
        limit,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({ message: "Budget created", budget });
  } catch (err: any) {
    logger.error(`Error creating budget: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/budgets:
 *   get:
 *     summary: Get all budgets for the user
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 *       500:
 *         description: Internal error
 */
export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user!.id },
      include: { category: true },
      orderBy: { startDate: "desc" },
    });

    res.status(200).json({ budgets });
  } catch (err: any) {
    logger.error(`Error fetching budgets: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Budget updated
 *       404:
 *         description: Budget not found
 */
export const updateBudget = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { limit, startDate, endDate } = req.body;

  try {
    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        limit: limit ?? budget.limit,
        startDate: startDate ? new Date(startDate) : budget.startDate,
        endDate: endDate ? new Date(endDate) : budget.endDate,
      },
    });

    res.status(200).json({ message: "Budget updated", budget: updatedBudget });
  } catch (err: any) {
    logger.error(`Error updating budget: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v2/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted
 *       404:
 *         description: Budget not found
 */
export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({ where: { id } });

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err: any) {
    logger.error(`Error deleting budget: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
