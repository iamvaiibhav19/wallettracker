import { toast } from "sonner";
import axiosInstance from "../axios";

async function requestOTP(email: string) {
  try {
    const response = await axiosInstance.post("/auth/request-otp", { email });
    toast.success("OTP sent successfully");
    return response.data;
  } catch (err: any) {
    console.error("Error in requestOTP", err);
    toast.error(err.response?.data?.message || "An error occurred while sending OTP");
    throw err;
  }
}

export default requestOTP;
