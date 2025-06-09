"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/Common/PageHeader";
import { useDateRangeStore } from "@/store/customDateRangeStore";
import { endOfMonth, startOfMonth } from "date-fns";
import TransactionDataTable from "@/components/Transactions/TransactionsTable";
import { AddTransactionModal } from "@/components/Transactions/AddTransactionModal";

const Page = () => {
  const { range, setRange, setSelectedLabel } = useDateRangeStore();
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

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
      <PageHeader
        title="Transactions"
        showDownload={false}
        showDatePicker={false}
        AddButton={
          <AddTransactionModal
            editTransactionId={editingTransactionId ?? undefined}
            onCloseEdit={() => setEditingTransactionId(null)}
            onSuccess={() => {
              setRefetch(!refetch);
            }}
          />
        }
      />

      <TransactionDataTable
        params={params}
        refetch={refetch}
        onEdit={(id) => {
          setEditingTransactionId(id);
        }}
        onDelete={() => {
          setRefetch(!refetch);
        }}
      />
    </div>
  );
};

export default Page;
