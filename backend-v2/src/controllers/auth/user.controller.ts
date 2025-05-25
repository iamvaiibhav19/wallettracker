import { Request, Response } from "express";

import { Currency } from "../../constants/Currency";
import logger from "../../utils/logger";
import { prisma } from "../../models/prismaClient";
import { AuthenticatedRequest } from "middlewares/auth.middleware";
import { calculateChange, getPreviousPeriodDates } from "../../utils";

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

    // Create default categories for the user
    const categories = await prisma.category.createMany({
      data: [
        { userId: user.id, name: "Groceries" },
        { userId: user.id, name: "Utilities" },
        { userId: user.id, name: "Entertainment" },
        { userId: user.id, name: "Transport" },
        { userId: user.id, name: "Health" },
        { userId: user.id, name: "Other" },
      ],
    });

    if (categories.count > 0) {
      logger.info(`Default categories created successfully for userId: ${userId}`);
    }

    logger.info(`Onboarding successful for userId: ${userId}`);
    res.status(200).json({
      message: "User onboarded successfully",
      user,
      bankAccount,
      categories: categories.count,
    });
  } catch (err: any) {
    logger.error(`Onboarding failed for userId: ${userId} - ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v2/user/me:
 *   get:
 *     summary: Get user information
 *     description: Fetches basic information about the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username
 *                 email:
 *                   type: string
 *                   description: Email address
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date of account creation
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date of last account update
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export const getUserInfo = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Fetch user information from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      logger.error(`User not found for userId: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err: any) {
    logger.error(`Failed to fetch user information for userId: ${userId} - ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v2/user/net-worth:
 *   get:
 *     summary: Get user's net worth summary
 *     description: Calculates net worth, income, expenses, savings, and change percentage based on an optional date range.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the summary period (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the summary period (optional)
 *     responses:
 *       200:
 *         description: Summary data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 netWorth:
 *                   type: number
 *                   description: Total balance across all accounts
 *                 income:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                     change_percentage:
 *                       type: number
 *                       nullable: true
 *                 expenses:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                     change_percentage:
 *                       type: number
 *                       nullable: true
 *                 savings:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                     change_percentage:
 *                       type: number
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export const getNetWorthSummary = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

    const getPreviousPeriod = (start: Date, end: Date) => {
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime());
      const prevStart = new Date(prevEnd.getTime() - duration);
      return { prevStart, prevEnd };
    };

    const calculateChange = (current: number, previous: number): number | null => {
      if (previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };

    const { prevStart, prevEnd } = startDate && endDate ? getPreviousPeriodDates(startDate, endDate) : { prevStart: null, prevEnd: null };

    // Net Worth (no date range)
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { balance: true },
    });
    const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Aggregates for income & expense
    const aggregateAmount = async (type: "income" | "expense", start?: Date, end?: Date) => {
      const where: any = { userId, type };
      if (start && end) where.date = { gte: start, lte: end };
      const result = await prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      });
      return result._sum.amount ?? 0;
    };

    const income = await aggregateAmount("income", startDate!, endDate!);
    const expenses = await aggregateAmount("expense", startDate!, endDate!);
    const savings = income - expenses;

    const prevIncome = startDate && endDate ? await aggregateAmount("income", prevStart!, prevEnd!) : 0;
    const prevExpenses = startDate && endDate ? await aggregateAmount("expense", prevStart!, prevEnd!) : 0;
    const prevSavings = prevIncome - prevExpenses;

    res.status(200).json({
      netWorth,
      income: {
        value: income,
        change_percentage: calculateChange(income, prevIncome),
      },
      expenses: {
        value: expenses,
        change_percentage: calculateChange(expenses, prevExpenses),
      },
      savings: {
        value: savings,
        change_percentage: calculateChange(savings, prevSavings),
      },
    });
  } catch (err: any) {
    logger.error(`Net worth summary failed for userId: ${req.user?.id} - ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v2/user/dashboard/overview:
 *   get:
 *     summary: Get overview metrics for user dashboard
 *     description: Returns key financial metrics with current and previous period data for dashboard summary cards.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date of the current period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date of the current period (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Dashboard overview metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 15000
 *                     previous:
 *                       type: number
 *                       example: 14000
 *                 netIncome:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 5000
 *                     previous:
 *                       type: number
 *                       example: 4500
 *                 totalExpenses:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 3000
 *                     previous:
 *                       type: number
 *                       example: 3500
 *                 totalBudgets:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 5
 *                     previous:
 *                       type: integer
 *                       example: 4
 *                 budgetSpentPercent:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 72
 *                     previous:
 *                       type: number
 *                       example: 65
 *                 totalDebtsOutstanding:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 12000
 *                     previous:
 *                       type: number
 *                       example: 13000
 *                 monthlyEmiPaid:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: number
 *                       example: 1500
 *                     previous:
 *                       type: number
 *                       example: 1500
 *                 recentTransactionsCount:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 10
 *                     previous:
 *                       type: integer
 *                       example: 12
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
export const getDashboardOverview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = (req as any).user?.id;
  let { startDate, endDate } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Default date range to "all time" if not provided
  const start = startDate ? new Date(startDate as string) : new Date("1970-01-01");
  const end = endDate ? new Date(endDate as string) : new Date();

  // Previous period logic (defaulting to same duration before current start)
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);

  try {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { balance: true },
    });
    const totalBalanceCurrent = accounts.reduce((acc, a) => acc + a.balance, 0);
    const totalBalancePrevious = totalBalanceCurrent; // approx

    const [txnsCurrent, txnsPrevious] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { amount: true, type: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: prevStart, lte: prevEnd } },
        select: { amount: true, type: true },
      }),
    ]);

    const summarizeTxns = (txns: any[]) => {
      let income = 0,
        expense = 0;
      txns.forEach(({ amount, type }) => {
        if (type === "income") income += amount;
        else if (type === "expense" || type === "lend") expense += amount;
      });
      return { income, expense };
    };

    const currSummary = summarizeTxns(txnsCurrent);
    const prevSummary = summarizeTxns(txnsPrevious);

    const activeBudgetsCurrent = await prisma.budget.count({
      where: {
        userId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    const activeBudgetsPrevious = await prisma.budget.count({
      where: {
        userId,
        startDate: { lte: prevEnd },
        endDate: { gte: prevStart },
      },
    });

    async function calcBudgetSpentPercent(start: Date, end: Date) {
      const budgets = await prisma.budget.findMany({
        where: { userId, startDate: { lte: end }, endDate: { gte: start } },
        select: { limit: true, categoryId: true },
      });

      const spentData = await Promise.all(
        budgets.map(async (b) => {
          const spent = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              userId,
              categoryId: b.categoryId,
              type: "expense",
              date: { gte: start, lte: end },
            },
          });
          return { spent: spent._sum.amount || 0, limit: b.limit };
        })
      );

      const totalSpent = spentData.reduce((a, b) => a + b.spent, 0);
      const totalLimit = spentData.reduce((a, b) => a + b.limit, 0);

      return totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    }

    const budgetSpentCurrent = await calcBudgetSpentPercent(start, end);
    const budgetSpentPrevious = await calcBudgetSpentPercent(prevStart, prevEnd);

    const debtsAgg = await prisma.debt.aggregate({
      _sum: { outstanding: true },
      where: { userId, isActive: true },
    });

    const emiPaidCurrentAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "expense",
        debtId: { not: null },
        date: { gte: start, lte: end },
      },
    });

    const emiPaidPreviousAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "expense",
        debtId: { not: null },
        date: { gte: prevStart, lte: prevEnd },
      },
    });

    return res.status(200).json({
      totalBalance: {
        current: totalBalanceCurrent,
        previous: totalBalancePrevious,
        changePercent: calculateChange(totalBalanceCurrent, totalBalancePrevious),
      },
      netIncome: {
        current: currSummary.income,
        previous: prevSummary.income,
        changePercent: calculateChange(currSummary.income, prevSummary.income),
      },
      totalExpenses: {
        current: currSummary.expense,
        previous: prevSummary.expense,
        changePercent: calculateChange(currSummary.expense, prevSummary.expense),
      },
      totalBudgets: {
        current: activeBudgetsCurrent,
        previous: activeBudgetsPrevious,
        changePercent: calculateChange(activeBudgetsCurrent, activeBudgetsPrevious),
      },
      budgetSpentPercent: {
        current: budgetSpentCurrent,
        previous: budgetSpentPrevious,
        changePercent: calculateChange(budgetSpentCurrent, budgetSpentPrevious),
      },
      totalDebtsOutstanding: {
        current: debtsAgg._sum.outstanding || 0,
        previous: debtsAgg._sum.outstanding || 0,
        changePercent: 0,
      },
      monthlyEmiPaid: {
        current: emiPaidCurrentAgg._sum.amount || 0,
        previous: emiPaidPreviousAgg._sum.amount || 0,
        changePercent: calculateChange(emiPaidCurrentAgg._sum.amount || 0, emiPaidPreviousAgg._sum.amount || 0),
      },
      recentTransactionsCount: {
        current: txnsCurrent.length,
        previous: txnsPrevious.length,
        changePercent: calculateChange(txnsCurrent.length, txnsPrevious.length),
      },
    });
  } catch (error: any) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
