import { formatDate, formatDateTime } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";

export const transactionsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDateTime(info.getValue() as string),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => `${info.getValue()}`,
  },
  {
    id: "category",
    accessorFn: (row) => row.category.name,
    header: "Category",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "accountId",
    header: "Account",
  },
  {
    accessorKey: "targetName",
    header: "Target",
    cell: (info) => info.getValue() || "-",
  },
  {
    accessorKey: "reminderDate",
    header: "Reminder Date",
    cell: (info) => {
      const val = info.getValue() as string | Date;
      return val ? formatDate(val) : "-";
    },
  },
  {
    accessorKey: "destinationAccountId",
    header: "Destination Account",
    cell: (info) => info.getValue() || "-",
  },
];
