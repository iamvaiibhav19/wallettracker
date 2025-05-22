import PageHeader from "@/components/Common/PageHeader";
import NetWorthSummaryCard from "@/components/Dashboard/NetWorthSummaryCard";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="flex flex-col h-screen ">
      {/* Page Header */}
      <PageHeader title="Dashboard" />

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
        {/* Net Worth Summary Card */}
        <NetWorthSummaryCard
          income={2500}
          expense={1500}
          saving={1000}
          incomeChange={5} // Example percentages
          expenseChange={-10}
          savingChange={2}
        />

        {/* Other Grid Items (if any) */}
      </div>
    </div>
  );
};

export default DashboardPage;
