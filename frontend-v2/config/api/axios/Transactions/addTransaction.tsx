import { toast } from "sonner";
import axiosInstance from "../axios";

interface AddTransactionPayload {
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

async function addTransaction(payload: AddTransactionPayload) {
  try {
    const res = await axiosInstance.post("/transactions/create ", payload, {
      withAuth: true,
    });

    toast.success("Transaction added successfully");
    return res.data;
  } catch (err: any) {
    console.error("Error in addTransaction", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred during transaction creation");
    throw err;
  }
}

export default addTransaction;
