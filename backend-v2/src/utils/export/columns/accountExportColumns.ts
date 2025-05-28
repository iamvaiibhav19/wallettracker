import { Account } from "@prisma/client";

interface ExportColumn {
  header: string;
  key: string;
  format?: (row: Account) => any;
}

export const accountExportColumns: ExportColumn[] = [
  {
    header: "ID",
    key: "id",
  },
  {
    header: "Account Name",
    key: "name",
  },
  {
    header: "Type",
    key: "type",
    format: (row) => {
      const type = row.type as string;
      return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    },
  },
  {
    header: "Balance",
    key: "balance",
    format: (row) => row.balance?.toFixed(2) || "0.00",
  },
  {
    header: "Created At",
    key: "createdAt",
    format: (row) =>
      new Date(row.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    header: "Updated At",
    key: "updatedAt",
    format: (row) =>
      new Date(row.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];
