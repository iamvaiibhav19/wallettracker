import { toast } from "sonner";
import axiosInstance from "../axios";

interface OverviewMetricsParams {
  startDate?: string;
  endDate?: string;
}

async function getOverviewMetrics({ startDate, endDate }: OverviewMetricsParams) {
  const params: OverviewMetricsParams = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  try {
    const response = await axiosInstance.get("/user/dashboard/overview", {
      withAuth: true,
      params,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error in getOverviewMetrics", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred while fetching overview metrics");
    throw err;
  }
}

export default getOverviewMetrics;
