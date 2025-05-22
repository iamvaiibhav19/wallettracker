"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--color-brand-light)] [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand-dark)] cursor-pointer"
        ),
        day_range_start: "day-range-start bg-[var(--color-brand-dark)] text-white",
        day_range_end: "day-range-end bg-[var(--color-brand-dark)] text-white",
        day_selected: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] focus:bg-[var(--color-brand-dark)]",
        day_today: "bg-[var(--color-brand-lighter)] text-[var(--color-brand-dark)] font-semibold border border-[var(--color-brand)]",
        day_outside: "day-outside text-muted-foreground opacity-60",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-[var(--color-brand-light)] aria-selected:text-[var(--color-brand-dark)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => <ChevronLeft className={cn("size-4", className)} {...props} />,
        IconRight: ({ className, ...props }) => <ChevronRight className={cn("size-4", className)} {...props} />,
      }}
      {...props}
    />
  );
}

export { Calendar };
