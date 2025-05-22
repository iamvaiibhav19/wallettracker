"use client";
import React from "react";
import { DatePickerWithRange } from "./DateRangePicker";
import { Button } from "../ui/button";

const PageHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center">
        <DatePickerWithRange className="w-[300px] cursor-pointer" />
        {/* Download button */}
        <Button
          variant="outline"
          className="ml-2 bg-brand-dark text-white hover:bg-brand-dark hover:text-white transition duration-200 ease-in-out cursor-pointer"
          onClick={() => {
            // Handle download action
            console.log("Download clicked");
          }}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
