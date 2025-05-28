import { Category } from "@prisma/client";

interface ExportColumn {
  header: string;
  key: string;
  format?: (row: Category) => any;
}

export const categoryExportColumns: ExportColumn[] = [
  {
    header: "ID",
    key: "id",
  },
  {
    header: "Category Name",
    key: "name",
  },
  //   {
  //     header: "User ID",
  //     key: "userId",
  //   },
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
