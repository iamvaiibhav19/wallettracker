const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
};

function getPreviousPeriodDates(startDate: string | Date, endDate: string | Date): { prevStart: Date; prevEnd: Date } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - diff);
  return { prevStart, prevEnd };
}

export { calculateChange, getPreviousPeriodDates };
