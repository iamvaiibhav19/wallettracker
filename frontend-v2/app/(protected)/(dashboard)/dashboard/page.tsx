"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/Common/PageHeader";
import getOverviewMetrics from "@/config/api/axios/Dashboard/getOverviewMetrics";
import OverviewCard from "@/components/Common/OverviewCard";
import { useDateRangeStore } from "@/store/customDateRangeStore";
import { startOfMonth, endOfMonth } from "date-fns";
import getAllTransactions from "@/config/api/axios/Transactions/getRecentTransactionsData";
import RecentTransactionsCard from "@/components/Dashboard/RecentTransactions";

const DashboardPage = () => {
  const { range, setRange, setSelectedLabel } = useDateRangeStore();

  const [pagination, setPagination] = useState<{ page: number; limit: number; totalPages: number }>({ page: 1, limit: 5, totalPages: 1 });

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const defaultRange = {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    };
    setRange(defaultRange);
    setSelectedLabel("This Month");
  }, [setRange, setSelectedLabel]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await getAllTransactions({ page: 1, limit: 5 });
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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

    if (range.from && range.to) {
      fetchOverview();
    } else {
      setOverview(null);
      setLoading(false);
    }
  }, [range]);

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
    // makeCardData("EMI Paid", monthlyEmiPaid),
    // makeCardData("Recent Transactions", recentTransactionsCount),
  ];

  const handleViewMore = () => {
    // redirect to transactions page with current date range
    const params = new URLSearchParams();
    if (range.from) params.append("startDate", range.from.toISOString());
    if (range.to) params.append("endDate", range.to.toISOString());
    params.append("page", String(pagination.page + 1));
    params.append("limit", String(pagination.limit));
    window.location.href = `/transactions?${params.toString()}`;
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 py-2">
        {cards.map((card, idx) => (
          <OverviewCard key={idx} {...card} loading={loading} />
        ))}
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RecentTransactionsCard transactions={transactions} onViewMore={handleViewMore} />
        {/* Add more widgets here as needed */}
      </div>
    </div>
  );
};

export default DashboardPage;
