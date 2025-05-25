import { Request, Response } from "express";
import { AuthenticatedRequest } from "middlewares/auth.middleware";
import { prisma } from "../../models/prismaClient";

/**
 * @swagger
 * tags:
 *   name: Debt
 *   description: Debt management and EMI tracking
 */

/**
 * @swagger
 * /api/v2/debt:
 *   post:
 *     summary: Create a new debt entry
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - principal
 *               - outstanding
 *               - monthlyEMI
 *               - interestRate
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the debt, e.g. Home Loan
 *               principal:
 *                 type: number
 *                 description: Original loan amount
 *               outstanding:
 *                 type: number
 *                 description: Remaining amount to be paid
 *               monthlyEMI:
 *                 type: number
 *                 description: Monthly EMI amount
 *               interestRate:
 *                 type: number
 *                 description: Annual interest rate in percentage
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Loan start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Loan end date (optional)
 *               isActive:
 *                 type: boolean
 *                 description: Whether the debt is active (default true)
 *     responses:
 *       201:
 *         description: Debt created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const createDebt = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, principal, outstanding, monthlyEMI, interestRate, startDate, endDate, isActive } = req.body;

    if (!name || !principal || !outstanding || !monthlyEMI || !interestRate || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const debt = await prisma.debt.create({
      data: {
        userId: req.user!.id,
        name,
        principal,
        outstanding,
        monthlyEMI,
        interestRate,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({ message: "Debt created", debt });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/v2/debt:
 *   get:
 *     summary: Get all debts of the authenticated user
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of debts
 *       500:
 *         description: Internal server error
 */
export const getDebts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const debts = await prisma.debt.findMany({ where: { userId } });
    res.status(200).json({ debts });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/v2/debt/{id}:
 *   put:
 *     summary: Update a debt by ID
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Debt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               principal:
 *                 type: number
 *               outstanding:
 *                 type: number
 *               monthlyEMI:
 *                 type: number
 *               interestRate:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Debt updated successfully
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 */
export const updateDebt = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const debtId = req.params.id;
    const userId = req.user!.id;
    const updateData = req.body;

    const existingDebt = await prisma.debt.findFirst({
      where: { id: debtId, userId },
    });

    if (!existingDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const updatedDebt = await prisma.debt.update({
      where: { id: debtId },
      data: updateData,
    });

    res.status(200).json({ message: "Debt updated", debt: updatedDebt });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/v2/debt/{id}:
 *   delete:
 *     summary: Delete a debt by ID
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Debt ID
 *     responses:
 *       200:
 *         description: Debt deleted successfully
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 */
export const deleteDebt = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const debtId = req.params.id;
    const userId = req.user!.id;

    const existingDebt = await prisma.debt.findFirst({
      where: { id: debtId, userId },
    });

    if (!existingDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    await prisma.debt.delete({ where: { id: debtId } });
    res.status(200).json({ message: "Debt deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
