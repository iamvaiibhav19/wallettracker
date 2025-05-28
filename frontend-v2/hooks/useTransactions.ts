import { getAllTransactions } from "@/config/api/axios/Transactions/getRecentTransactionsData";
import { TransactionsParams } from "@/types/transactions";
import { useQuery } from "@tanstack/react-query";

export const useTransactions = (params: TransactionsParams) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getAllTransactions(params),
  });
};
