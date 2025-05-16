import { toast } from "sonner";
import axiosInstance from "../axios";

function verifyEmail(payload: { email: string; code: string }) {
  return new Promise(async (resolve, reject) => {
    const { email, code } = payload;
    if (!email || !code) {
      toast.error("Email and code are required");
      return reject(new Error("Email and code are required"));
    }
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        email,
        code,
      });

      toast.success("Email verified successfully");
      resolve(res.data);
    } catch (err: any) {
      console.error(err, "Error in verifyEmail");
      toast.error(err.response?.data?.message || error.response?.data?.error || "An error occurred while verifying email");
      reject(err);
    }
  });
}

export default verifyEmail;
