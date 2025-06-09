"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DatePickerWithRange } from "./DateRangePicker";
import { MultiSelect } from "./MultiSelect";

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "input" | "dateRange" | "multi-select";
  options?: { label: string; value: string }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalRecords?: number;
  onExportClick?: () => void;
  filtersConfig?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalRecords = 0,
  onExportClick,
  filtersConfig = [],
  filterValues = {},
  onFilterChange,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  if (onEdit || onDelete) {
    // Add edit and delete actions to the columns if needed
    columns = [
      ...columns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(row.original.id)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(row.original)}>
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ];
  }

  // Add a default column for row selection if needed
  // {
  //   id: 'selection',
  //   header: ({ table }) => (
  //     <input
  //       type="checkbox"
  //       {...{
  //         checked: table.getIsAllRowsSelected(),
  //         onChange: table.getToggleAllRowsSelectedHandler(),
  //       }}
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <input
  //       type="checkbox"
  //       {...{
  //         checked: row.getIsSelected(),
  //         onChange: row.getToggleSelectedHandler(),
  //       }}
  //     />
  //   ),
  // },

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Internal filters state for UI editing — start from prop filterValues
  const [internalFilters, setInternalFilters] = useState<Record<string, any>>(filterValues);

  // Sync internalFilters with filterValues prop when it changes from API or parent
  useEffect(() => {
    const hasChanged = JSON.stringify(internalFilters) !== JSON.stringify(filterValues);
    if (hasChanged) {
      setInternalFilters(filterValues);
    }
  }, [filterValues]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
  });

  // Save button click — apply filters by calling onFilterChange with current internalFilters
  const handleSaveFilters = () => {
    onFilterChange?.(internalFilters);
  };

  // Restore button click — reset internalFilters to current filterValues (no API call)
  const handleRestoreFilters = () => {
    setInternalFilters(filterValues);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {onSearchChange && (
          <div className="py-4 flex gap-4 items-center">
            <Input
              placeholder={searchPlaceholder ?? "Search..."}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <DatePickerWithRange />
          {filtersConfig.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-4 w-4" /> Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-4" align="end" side="bottom">
                {filtersConfig.map((filter) => {
                  const value = internalFilters[filter.key] ?? (filter.type === "multi-select" ? [] : "");
                  switch (filter.type) {
                    case "select":
                      return (
                        <div key={filter.key} className="flex flex-col gap-1">
                          <label className="text-sm font-medium">{filter.label}</label>
                          <select
                            value={value}
                            onChange={(e) => {
                              setInternalFilters((prev) => ({ ...prev, [filter.key]: e.target.value }));
                            }}
                            className="border rounded px-2 py-1 text-sm">
                            <option value="">All</option>
                            {filter.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    case "input":
                      return (
                        <div key={filter.key} className="flex flex-col gap-1">
                          <label className="text-sm font-medium">{filter.label}</label>
                          <Input
                            value={value}
                            placeholder={`Enter ${filter.label}`}
                            onChange={(e) => {
                              setInternalFilters((prev) => ({ ...prev, [filter.key]: e.target.value }));
                            }}
                          />
                        </div>
                      );
                    case "dateRange":
                      return (
                        <div key={filter.key} className="flex flex-col gap-1">
                          <label className="text-sm font-medium">{filter.label}</label>
                          {/* Implement your DatePickerWithRange here */}
                        </div>
                      );
                    case "multi-select":
                      return (
                        <div key={filter.key} className="flex flex-col gap-1">
                          <label className="text-sm font-medium">{filter.label}</label>
                          <MultiSelect
                            options={filter.options || []}
                            defaultValue={value || []}
                            onValueChange={(newVal) => {
                              setInternalFilters((prev) => ({ ...prev, [filter.key]: newVal }));
                            }}
                            placeholder={`Select ${filter.label}`}
                            maxCount={3}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}

                {/* Save and Restore Buttons */}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <Button variant="outline" className="text-xs" onClick={handleRestoreFilters}>
                    Restore
                  </Button>
                  <Button
                    variant="default"
                    className="text-xs text-white bg-brand-dark hover:bg-opacity-90 hover:bg-brand-dark transition duration-200 ease-in-out"
                    onClick={handleSaveFilters}>
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {onExportClick && (
            <Button variant="outline" onClick={onExportClick}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-300">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100 border-b border-gray-300">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-left font-semibold px-4 py-2 select-none hover:bg-gray-200 bg-brand-lighter text-brand-dark">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-gray-300 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow key={row.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors cursor-pointer`}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4">
        <div className="text-sm text-muted-foreground">
          {/* show starting and ending record numbers */}
          {totalRecords > 0 ? (currentPage - 1) * 10 + 1 : 0} - {Math.min(currentPage * 10, totalRecords)} of {totalRecords} records
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}>
            Previous
          </Button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button variant="outline" size="sm" onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
