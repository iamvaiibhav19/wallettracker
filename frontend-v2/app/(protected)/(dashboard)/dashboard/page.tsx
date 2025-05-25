"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/Common/PageHeader";
import getOverviewMetrics from "@/config/api/axios/Dashboard/getOverviewMetrics";
import OverviewCard from "@/components/Common/OverviewCard";
import { useDateRangeStore } from "@/store/customDateRangeStore"; // import your date range store

const DashboardPage = () => {
  const { range } = useDateRangeStore(); // get the current date range from the store
  const [overview, setOverview] = useState<any>({
    totalBalance: { current: 0, previous: 0 },
    netIncome: { current: 0, previous: 0 },
    totalExpenses: { current: 0, previous: 0 },
    totalBudgets: { current: 0, previous: 0 },
    budgetSpentPercent: { current: 0, previous: 0 },
    totalDebtsOutstanding: { current: 0, previous: 0 },
    monthlyEmiPaid: { current: 0, previous: 0 },
    recentTransactionsCount: { current: 0, previous: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        // Pass startDate and endDate from the selected range
        const data = await getOverviewMetrics({
          startDate: range.from ? range.from.toISOString() : undefined,
          endDate: range.to ? range.to.toISOString() : undefined,
        });
        setOverview(data);
      } catch {
        console.error("Failed to fetch overview metrics");
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if both dates are selected
    if (range.from && range.to) {
      fetchOverview();
    } else {
      setOverview(null);
      setLoading(false);
    }
  }, [range]); // refetch whenever the date range changes

  const { totalBalance, netIncome, totalExpenses, totalBudgets, budgetSpentPercent, totalDebtsOutstanding, monthlyEmiPaid, recentTransactionsCount } =
    overview;

  const makeCardData = (label: string, data: any) => ({
    label,
    current: data.current || 0,
    previous: data.previous || 0,
    changePercent: data.previous === 0 ? (data.current === 0 ? 0 : 100) : ((data.current - data.previous) / data.previous) * 100,
  });

  const cards = [
    makeCardData("Total Balance", totalBalance),
    makeCardData("Net Income", netIncome),
    makeCardData("Total Expenses", totalExpenses),
    makeCardData("Budgets Active", totalBudgets),
    makeCardData("Budget Spent %", budgetSpentPercent),
    makeCardData("Debts Outstanding", totalDebtsOutstanding),
    makeCardData("EMI Paid", monthlyEmiPaid),
    makeCardData("Recent Transactions", recentTransactionsCount),
  ];

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 py-2">
        {cards.map((card, idx) => (
          <OverviewCard key={idx} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
