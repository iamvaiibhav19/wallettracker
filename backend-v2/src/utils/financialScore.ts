/*
We define 5 components contributing to the final score:

Component	         Weight	  Calculation
Net Worth	         25%	  Higher net worth → higher score (normalized to a threshold like $10,000)
Savings Rate	     25%	  (savings / income) * 100 if income > 0
Expense Ratio	     20%	  expenses / income → lower is better
Budget Adherence	 20%	  totalSpent / totalBudget → lower is better
Income Growth	     10%	  (income - prevIncome) / prevIncome if prevIncome > 0
*/

const getMonthDifference = (start: Date, end: Date) => {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * 12 + months || 1;
};

const computeFinancialScore = (
  netWorth: number,
  income: number,
  expenses: number,
  savings: number,
  budgetUsage: number,
  incomeChange: number | null,
  startDate?: Date,
  endDate?: Date
): number => {
  const savingsRate = income > 0 ? savings / income : 0;
  const expenseRatio = income > 0 ? expenses / income : 1;

  let score = 0;

  // Net Worth: dynamic based on income
  let netWorthScore = 0;
  if (startDate && endDate && income > 0) {
    const months = getMonthDifference(startDate, endDate);
    const avgMonthlyIncome = income / months;
    const incomeMultiplier = 6; // Net worth should ideally be 6x avg monthly income
    const idealNetWorth = avgMonthlyIncome * incomeMultiplier;

    netWorthScore = Math.min(netWorth / idealNetWorth, 1) * 25;
  }
  score += netWorthScore;

  // Savings Rate
  if (savingsRate >= 0.2) score += 25;
  else if (savingsRate >= 0.1) score += 15;
  else if (savingsRate > 0) score += 10;

  // Expense Ratio
  if (expenseRatio < 0.5) score += 20;
  else if (expenseRatio < 0.75) score += 15;
  else if (expenseRatio < 1.0) score += 10;
  else score += 5;

  // Budget Adherence
  if (budgetUsage <= 0.7) score += 20;
  else if (budgetUsage <= 1.0) score += 10;
  else score += 0;

  // Income Change
  if (incomeChange !== null) {
    if (incomeChange > 0.2) score += 10;
    else if (incomeChange > 0) score += 5;
  }

  return Math.round(score);
};

module.exports = {
  computeFinancialScore,
};
