import { Transaction, Category } from "@prisma/client";

interface ExportColumn {
  header: string;
  key: string;
  format?: (row: Transaction & { category: Category | null }) => any;
}

export const transactionExportColumns: ExportColumn[] = [
  {
    header: "Date",
    key: "date",
    format: (row) =>
      new Date(row.date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    header: "Description",
    key: "description",
  },
  {
    header: "Amount",
    key: "amount",
    format: (row) => `$${row.amount.toFixed(2)}`,
  },
  {
    header: "Category",
    key: "category",
    format: (row) => row?.category?.name ?? "-",
  },
  {
    header: "Type",
    key: "type",
  },
  {
    header: "Account",
    key: "accountId",
  },
  {
    header: "Target",
    key: "targetName",
    format: (row) => row.targetName ?? "-",
  },
  {
    header: "Reminder Date",
    key: "reminderDate",
    format: (row) =>
      row.reminderDate
        ? new Date(row.reminderDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
  {
    header: "Destination Account",
    key: "destinationAccountId",
    format: (row) => row.destinationAccountId ?? "-",
  },
];
