import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { transactionsColumns } from "./TransactionColumns";
import { DataTable, FilterConfig } from "../Common/DataTable";

import { saveAs } from "file-saver";
import { exportTransactions } from "@/config/api/axios/Transactions/getRecentTransactionsData";
import { toast } from "sonner";
import { LoadingOverlay } from "../Common/LoadingOverlay";
import { useCategories } from "@/hooks/useCategories";

export default function TransactionsTable({ params: initialParams }: { params: any }) {
  // Initialize filters with matching default types
  const [filters, setFilters] = useState<any>({
    category: [],
    minAmount: "",
    maxAmount: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const categoryOptions =
    categoriesData?.categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) ?? [];

  const filtersConfig = [
    {
      label: "Category",
      key: "category",
      type: "multi-select",
      options: categoryOptions,
      loading: categoriesLoading,
    },
    {
      label: "Min Amount",
      key: "minAmount",
      type: "input",
    },
    {
      label: "Max Amount",
      key: "maxAmount",
      type: "input",
    },
  ] as FilterConfig[];

  // Parsing filters to ensure correct types
  const parsedFilters = {
    ...filters,
    minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
  };

  const params = {
    ...initialParams,
    search,
    page,
    limit,
    category: filters.category && filters.category.length > 0 ? filters.category.join(",") : undefined,
    maxAmount: parsedFilters.maxAmount,
    minAmount: parsedFilters.minAmount,
  };
  const { data, isLoading } = useTransactions(params);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportTransactions({ ...initialParams, search, filters: parsedFilters, isExport: true });
      const unixTimestamp = new Date().getTime();
      const filename = `Transactions_${unixTimestamp}.xlsx`;
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
        columns={transactionsColumns}
        data={data?.transactions ?? []}
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
        filtersConfig={filtersConfig}
        filterValues={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />
    </>
  );
}
