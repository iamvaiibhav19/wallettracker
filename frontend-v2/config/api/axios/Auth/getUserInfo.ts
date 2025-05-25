import { toast } from "sonner";
import axiosInstance from "../axios";

async function getUserInfo() {
  try {
    const response = await axiosInstance.get("/user/me", { withAuth: true });
    return response.data;
  } catch (err: any) {
    console.error("Error in getUserInfo", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred while fetching user info");
    throw err;
  }
}

export default getUserInfo;
