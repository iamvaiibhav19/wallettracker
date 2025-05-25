import { Card, CardContent } from "@/components/ui/card";

import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../ui/skeleton";

interface OverviewCardProps {
  label: string;
  current: number;
  previous: number;
  changePercent: number;
  loading?: boolean;
}

const OverviewCard = ({ label, current, previous, changePercent, loading = false }: OverviewCardProps) => {
  const getColor = () => {
    if (changePercent > 0) return "text-green-600";
    if (changePercent < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <Card>
      <CardContent className="min-h-[100px]">
        <AnimatePresence>
          {loading ? (
            <>
              <div className="text-sm text-muted-foreground">{label}</div>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-2xl font-bold">{current.toLocaleString()}</div>
              <div className={`text-sm mt-1 ${getColor()}`}>
                {changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(2)}%
              </div>
            </>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
