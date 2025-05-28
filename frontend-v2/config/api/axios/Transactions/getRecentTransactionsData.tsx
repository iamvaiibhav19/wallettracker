import { toast } from "sonner";
import axiosInstance from "../axios";
import { TransactionsParams, TransactionsResponse } from "@/types/transactions";

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

async function exportTransactions(params: TransactionsParams = {}): Promise<Blob> {
  try {
    const response = await axiosInstance.get("/transactions", {
      withAuth: true,
      params,
      responseType: "blob",
    });
    return response.data;
  } catch (err: any) {
    console.error("Error exporting transactions", err);
    throw err;
  }
}

export { getAllTransactions, exportTransactions };
