import { formatDateTime } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";

export const accountsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Account Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => {
      const type = info.getValue() as string;
      return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: (info) => {
      const balance = (info.getValue() as number | undefined) || 0;

      if (balance < 0) {
        return <span style={{ color: "red" }}>{balance?.toFixed(2) || "0.00"}</span>;
      } else {
        return <span style={{ color: "green" }}>{balance?.toFixed(2) || "0.00"}</span>;
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: (info) => formatDateTime(info.getValue() as string),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: (info) => formatDateTime(info.getValue() as string),
  },
];
