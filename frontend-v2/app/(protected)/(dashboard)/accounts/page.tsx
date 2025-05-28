"use client";
import AccountsTable from "@/components/Accounts/AccountsTable";
import PageHeader from "@/components/Common/PageHeader";
import { useDateRangeStore } from "@/store/customDateRangeStore";
import { endOfMonth, startOfMonth } from "date-fns";
import { useEffect } from "react";

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
      <PageHeader title="Accounts" showDownload={false} showDatePicker={false} />

      <AccountsTable params={params} />
    </div>
  );
};

export default Page;
