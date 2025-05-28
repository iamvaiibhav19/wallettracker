import { toast } from "sonner";
import axiosInstance from "../axios";

interface TransactionsParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  category?: string;
  label?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function getAllTransactions(params: TransactionsParams = {}): Promise<TransactionsResponse> {
  try {
    const response = await axiosInstance.get("/transactions", {
      withAuth: true,
      params,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error in getRecentTransactionWidgetData", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to fetch transactions");
    throw err;
  }
}

export default getAllTransactions;
