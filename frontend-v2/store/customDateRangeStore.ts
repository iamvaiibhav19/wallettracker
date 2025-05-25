// stores/useDateRangeStore.ts
import { create } from "zustand";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";

type PredefinedRangeLabel = string | null;

interface DateRangeState {
  range: DateRange;
  selectedLabel: PredefinedRangeLabel;
  setRange: (range: DateRange) => void;
  setSelectedLabel: (label: PredefinedRangeLabel) => void;
}

export const useDateRangeStore = create<DateRangeState>((set) => ({
  range: {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  selectedLabel: "This Month",
  setRange: (range) => set({ range }),
  setSelectedLabel: (label) => set({ selectedLabel: label }),
}));
