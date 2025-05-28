import { formatDate } from "date-fns";
import { DateRange } from "react-day-picker";

// Helper to format the date as "MMM d, yyyy"
function formatDateRange(range: DateRange) {
  if (!range.from || !range.to) return "No date selected";
  const from = formatDate(range.from, "MMM d, yyyy");
  const to = formatDate(range.to, "MMM d, yyyy");
  if (from === to) return from;
  return `${from} - ${to}`;
}

export { formatDateRange };
