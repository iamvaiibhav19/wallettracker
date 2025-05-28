"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import getTransactionHeatmap from "@/config/api/axios/Transactions/getTransactionHeatmap";
import HeatmapChart from "../Common/HeatMapChart";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
}

interface HeatmapData {
  date: string;
  count: number;
}

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  onViewMore?: () => void;
}

// function fillDateGaps(data: HeatmapData[], start: string, end: string): HeatmapData[] {
//   const result: HeatmapData[] = [];
//   let current = new Date(start);
//   const last = new Date(end);

//   while (current <= last) {
//     const isoDate = current.toISOString().slice(0, 10);
//     const found = data.find((d) => d.date === isoDate);
//     result.push(found || { date: isoDate, count: 0 });
//     current.setDate(current.getDate() + 1);
//   }

//   return result;
// }

const RecentTransactionsCard = ({ transactions, onViewMore }: RecentTransactionsCardProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  const maxVisible = 3;
  const visibleTransactions = transactions.slice(0, maxVisible);

  // Define date range for heatmap outside useEffect to pass to HeatmapChart
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1); // 1 year ago

  //   useEffect(() => {
  //     async function fetchHeatmap() {
  //       try {
  //         const response = await getTransactionHeatmap();
  //         const rawData = response.data || [];

  //         const filledData = fillDateGaps(rawData, startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10));

  //         setHeatmapData(filledData);
  //       } catch (error) {
  //         console.error("Failed to load heatmap data", error);
  //       }
  //     }
  //     fetchHeatmap();
  //   }, []);

  return (
    <Card className="w-full mx-auto gap-0 bg-white shadow-sm rounded-lg py-2">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold px-4 w-full flex items-center">Recent Transactions</CardTitle>
      </CardHeader>

      <CardContent className="p-4 gap-4">
        {/* <div className="w-1/2">
          <h4 className="text-sm text-muted-foreground mb-2">Activity Heatmap</h4>
          <HeatmapChart data={heatmapData} year={2025} />
        </div> */}

        <div className="">
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground">No transactions</div>
          ) : (
            <ul className="divide-y divide-border">
              {visibleTransactions.map(({ id, date, description, amount, category }) => (
                <li key={id} className="flex justify-between items-center p-4 hover:bg-muted cursor-pointer">
                  <div>
                    <div className="font-semibold">{description}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(date), "MMM dd, yyyy")}{" "}
                      {category && (
                        <Badge variant="outline" className="mt-1">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`font-medium ${amount < 0 ? "text-red-600" : "text-green-600"}`}>
                    {amount < 0 ? "-" : "+"}${Math.abs(amount).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      {transactions.length > maxVisible && (
        <CardFooter>
          <Button variant="link" className="mx-auto text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={onViewMore}>
            View More
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecentTransactionsCard;
