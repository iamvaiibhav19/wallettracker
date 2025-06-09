import { toast } from "sonner";
import axiosInstance from "../axios";

interface TransactionsParams {
  id: string;
}

async function getTransactionById(params: TransactionsParams): Promise<any> {
  if (!params.id) {
    throw new Error("Transaction ID is required");
  }
  try {
    const response = await axiosInstance.get("/transactions/" + params.id, {
      withAuth: true,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error in getTransactionById", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to fetch transaction");
    throw err;
  }
}

export default getTransactionById;
