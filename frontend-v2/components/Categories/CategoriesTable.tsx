import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";

import { DataTable, FilterConfig } from "../Common/DataTable";

import { saveAs } from "file-saver";
import { exportTransactions } from "@/config/api/axios/Transactions/getRecentTransactionsData";
import { toast } from "sonner";
import { LoadingOverlay } from "../Common/LoadingOverlay";
import { useCategories } from "@/hooks/useCategories";
import { categoriesColumns } from "./CategoriesColumns";
import { exportCategories } from "@/config/api/axios/Categories/getCategories";

export default function CategoriesTable({ params: initialParams }: { params: any }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    ...initialParams,
    search,
    page,
    limit,
  };
  const { data, isLoading } = useCategories(params);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportCategories({ ...initialParams, search, isExport: true });
      const filename = `Transactions_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(blob, filename);
      toast.success("Data exported successfully");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isExporting} />
      <DataTable
        columns={categoriesColumns}
        data={data?.categories ?? []}
        isLoading={isLoading || isExporting}
        searchValue={search}
        onSearchChange={(value) => {
          if (!isExporting) {
            setSearch(value);
            setPage(1);
          }
        }}
        searchPlaceholder="Search..."
        currentPage={page}
        totalPages={data?.pagination?.totalPages ?? 1}
        totalRecords={data?.pagination?.total ?? 0}
        onPageChange={(newPage) => {
          if (!isExporting) setPage(newPage);
        }}
        onExportClick={handleExport}
      />
    </>
  );
}
