import { toast } from "sonner";
import axiosInstance from "../axios";

interface HeatmapData {
  date: string;
  totalAmount: number;
}

async function getTransactionHeatmap(): Promise<HeatmapData[]> {
  try {
    const response = await axiosInstance.get("/transactions/heatmap", {
      withAuth: true,
    });

    return response?.data?.data || [];
  } catch (err: any) {
    console.error("Error fetching transaction heatmap", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to fetch heatmap data");
    throw err;
  }
}

export default getTransactionHeatmap;
