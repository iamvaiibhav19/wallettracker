import { formatDateTime } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";

export const categoriesColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Category Name",
  },
  //   {
  //     accessorKey: "userId",
  //     header: "User ID",
  //   },
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
