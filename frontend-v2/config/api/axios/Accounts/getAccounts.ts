import { AccountsParams, AccountsResponse } from "@/types/accounts";
import { toast } from "sonner";
import axiosInstance from "../axios";

async function getAllAccounts(params: AccountsParams = {}): Promise<AccountsResponse> {
  try {
    const response = await axiosInstance.get("/accounts", {
      withAuth: true,
      params,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error fetching accounts", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to fetch accounts");
    throw err;
  }
}

async function exportAccounts(params: AccountsParams = {}): Promise<Blob> {
  try {
    const response = await axiosInstance.get("/accounts", {
      withAuth: true,
      params,
      responseType: "blob",
    });
    return response.data;
  } catch (err: any) {
    console.error("Error exporting categories", err);
    throw err;
  }
}

export { getAllAccounts, exportAccounts };
