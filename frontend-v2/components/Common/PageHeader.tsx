"use client";
import React from "react";
import { DatePickerWithRange } from "./DateRangePicker";
import { Button } from "../ui/button";

// Type definition for the PageHeader component
interface PageHeaderProps {
  title: string;
  showDownload?: boolean;
  showDatePicker?: boolean;
}

const PageHeader = ({ title = "Page Title", showDownload = true, showDatePicker = true }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-800 flex-shrink-0">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 flex-grow min-w-[280px] justify-start md:justify-end">
        {showDatePicker && <DatePickerWithRange className="w-[200px]" />}
        {showDownload && (
          <Button
            variant="outline"
            className="bg-brand-dark text-white hover:bg-brand-dark hover:text-white transition duration-200 ease-in-out cursor-pointer"
            onClick={() => {}}>
            Download
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
