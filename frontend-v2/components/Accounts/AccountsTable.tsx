import { useState } from "react";

import { DataTable } from "../Common/DataTable";

import { saveAs } from "file-saver";
import { toast } from "sonner";
import { LoadingOverlay } from "../Common/LoadingOverlay";

import { useAccounts } from "@/hooks/useAccounts";
import { accountsColumns } from "./AccountColumns";
import { exportAccounts } from "@/config/api/axios/Accounts/getAccounts";

export default function AccountsTable({ params: initialParams }: { params: any }) {
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
  const { data, isLoading } = useAccounts(params);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportAccounts({ ...initialParams, search, isExport: true });
      const unixTimestamp = new Date().getTime();
      const filename = `Accounts_${unixTimestamp}.xlsx`;
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
        columns={accountsColumns}
        data={data?.accounts ?? []}
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
