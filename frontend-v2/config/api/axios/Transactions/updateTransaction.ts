import { toast } from "sonner";
import axiosInstance from "../axios";

interface UpdateTransactionPayload {
  id: string;
  amount: number;
  type: "income" | "expense" | "transfer" | "lend";
  accountId: string;
  categoryId?: string;
  description?: string;
  destinationAccountId?: string;
  targetName?: string;
  reminderDate?: string;
  date?: string;
}

async function updateTransaction(payload: UpdateTransactionPayload) {
  if (!payload.id) {
    throw new Error("Transaction ID is required");
  }
  try {
    const res = await axiosInstance.put("/transactions/" + payload.id, payload, {
      withAuth: true,
    });

    toast.success("Transaction updated successfully");
    return res.data;
  } catch (err: any) {
    console.error("Error in addTransaction", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred during transaction updation");
    throw err;
  }
}

export default updateTransaction;
