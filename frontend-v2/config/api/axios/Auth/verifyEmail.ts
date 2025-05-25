import { toast } from "sonner";
import axiosInstance from "../axios";

async function verifyEmail(payload: { email: string; code: string }) {
  const { email, code } = payload;
  if (!email || !code) {
    toast.error("Email and code are required");
    throw new Error("Email and code are required");
  }

  try {
    const response = await axiosInstance.post("/auth/verify-otp", { email, code });
    toast.success("Email verified successfully");
    return response.data;
  } catch (err: any) {
    console.error("Error in verifyEmail", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred while verifying email");
    throw err;
  }
}

export default verifyEmail;
