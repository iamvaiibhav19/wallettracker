"use client";

import * as React from "react";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  format,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDateRangeStore } from "@/store/customDateRangeStore";

const quickRanges: { label: string; range: DateRange }[] = [
  {
    label: "Today",
    range: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  },
  {
    label: "Last 7 Days",
    range: { from: subDays(new Date(), 6), to: endOfDay(new Date()) },
  },
  {
    label: "This Month",
    range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  },
  {
    label: "Last Month",
    range: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
  {
    label: "This Quarter",
    range: {
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    },
  },
  {
    label: "This Year",
    range: {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    },
  },
  {
    label: "Last Year",
    range: {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
    },
  },
];

// Helper to format the date range nicely
function formatDateRange(range: DateRange) {
  if (!range.from || !range.to) return "No date selected";
  const from = format(range.from, "MMM d, yyyy");
  const to = format(range.to, "MMM d, yyyy");
  if (from === to) return from;
  return `${from} - ${to}`;
}

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { range, setRange, selectedLabel, setSelectedLabel } = useDateRangeStore();
  const [isMobile, setIsMobile] = React.useState(false);

  // Local state for editing
  const [localRange, setLocalRange] = React.useState<DateRange>(range);
  const [localLabel, setLocalLabel] = React.useState<string | null>(selectedLabel);

  // Control popover open state
  const [open, setOpen] = React.useState(false);

  // Sync local with global when popover opens or global changes
  React.useEffect(() => {
    if (open) {
      setLocalRange(range);
      setLocalLabel(selectedLabel);
    }
  }, [open, range, selectedLabel]);

  const handleShortcutClick = (label: string, range: DateRange) => {
    setLocalRange(range);
    setLocalLabel(label);
  };

  const handleCancel = () => {
    setLocalRange(range);
    setLocalLabel(selectedLabel);
    setOpen(false);
  };

  const handleSave = () => {
    if (localRange.from && localRange.to) {
      setRange(localRange);
      setSelectedLabel(localLabel);
      setOpen(false);
    }
  };

  const displayLabel = selectedLabel || (range.from && range.to ? "Custom Range" : "Pick a date");

  React.useEffect(() => {
    // Check if the screen is mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto p-0" align="start">
          <div className="flex flex-col">
            {/* Show the selected date range summary on top */}
            <div className="border-b px-4 py-2 text-sm font-medium">{formatDateRange(localRange)}</div>

            <div className="flex">
              {/* Shortcuts */}
              <div className="flex flex-col border-r px-4 py-2 text-sm">
                {quickRanges.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleShortcutClick(item.label, item.range)}
                    className={cn("py-1.5 text-left", localLabel === item.label ? "font-semibold text-brand" : "text-muted-foreground")}>
                    {item.label}
                  </button>
                ))}

                <button
                  key="Custom Range"
                  onClick={() => handleShortcutClick("Custom Range", localRange)}
                  className={cn("py-1.5 text-left", localLabel === "Custom Range" ? "font-semibold text-brand" : "text-muted-foreground")}>
                  Custom Range
                </button>
              </div>

              {/* Calendar */}
              <div className="p-2">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={localRange.from}
                  selected={localRange}
                  onSelect={(r) => {
                    setLocalRange(r || { from: undefined, to: undefined });
                    setLocalLabel("Custom Range");
                  }}
                  numberOfMonths={isMobile ? 1 : 2}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 border-t px-4 py-2">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!localRange.from || !localRange.to}>
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
