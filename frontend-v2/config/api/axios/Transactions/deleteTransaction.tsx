import { toast } from "sonner";
import axiosInstance from "../axios";

interface TransactionsParams {
  id: string;
}

async function deleteTransaction(params: TransactionsParams): Promise<any> {
  if (!params.id) {
    throw new Error("Transaction ID is required");
  }
  try {
    const response = await axiosInstance.delete("/transactions/" + params.id, {
      withAuth: true,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error in deleteTransaction", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to delete transaction");
    throw err;
  }
}

export default deleteTransaction;
