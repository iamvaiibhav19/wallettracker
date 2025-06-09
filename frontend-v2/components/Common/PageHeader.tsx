"use client";
import React from "react";
import { DatePickerWithRange } from "./DateRangePicker";
import { Button } from "../ui/button";

// Type definition for the PageHeader component
interface PageHeaderProps {
  title: string;
  showDownload?: boolean;
  showDatePicker?: boolean;
  AddButton?: React.ReactNode;
}

const PageHeader = ({ title = "Page Title", showDownload = true, showDatePicker = true, AddButton }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 w-full md:w-auto">
        {showDatePicker && <DatePickerWithRange className="w-full sm:w-[200px]" />}

        {showDownload && (
          <Button
            variant="outline"
            className="bg-brand-dark text-white hover:bg-brand-dark hover:text-white transition duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
            onClick={() => {}}>
            Download
          </Button>
        )}

        {AddButton && <div className="w-full sm:w-auto">{AddButton}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
