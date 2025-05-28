"use client";

import React, { useEffect } from "react";
import PageHeader from "@/components/Common/PageHeader";
import { useDateRangeStore } from "@/store/customDateRangeStore";
import { endOfMonth, startOfMonth } from "date-fns";
import TransactionDataTable from "@/components/Transactions/TransactionsTable";

const Page = () => {
  const { range, setRange, setSelectedLabel } = useDateRangeStore();

  useEffect(() => {
    const defaultRange = {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    };
    setRange(defaultRange);
    setSelectedLabel("This Month");
  }, [setRange, setSelectedLabel]);

  const params = {
    startDate: range.from?.toISOString(),
    endDate: range.to?.toISOString(),
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Transactions" showDownload={false} showDatePicker={false} />

      {/* Pass params to your table */}
      <TransactionDataTable params={params} />
    </div>
  );
};

export default Page;
