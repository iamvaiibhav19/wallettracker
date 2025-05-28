import { DateRange } from "react-day-picker";

// Helper function to format date as "dd MMM yyyy"
const formatDate = (value: string | Date) => {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Helper to format the date as "MMM d, yyyy"
function formatDateRange(range: DateRange) {
  if (!range.from || !range.to) return "No date selected";
  const from = formatDate(range.from);
  const to = formatDate(range.to);
  if (from === to) return from;
  return `${from} - ${to}`;
}

// Helper functions to format date time - dd MMM yyyy, HH:mm
const formatDateTime = (value: string | Date) => {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export { formatDateRange, formatDateTime, formatDate };
