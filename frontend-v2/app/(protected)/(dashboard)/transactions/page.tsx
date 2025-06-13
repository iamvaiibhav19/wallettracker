"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/Common/PageHeader";
import { useDateRangeStore } from "@/store/customDateRangeStore";
import { endOfMonth, startOfMonth } from "date-fns";
import TransactionDataTable from "@/components/Transactions/TransactionsTable";
import { AddTransactionModal } from "@/components/Transactions/AddTransactionModal";
import deleteTransaction from "@/config/api/axios/Transactions/deleteTransaction";
import { toast } from "sonner";

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

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTransaction({ id });

      if (res) {
        setRefetch(!refetch);
      }

      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);

      toast.error("Failed to delete transaction");
    }
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
        onDelete={(id) => {
          handleDelete(id);
        }}
      />
    </div>
  );
};

export default Page;
