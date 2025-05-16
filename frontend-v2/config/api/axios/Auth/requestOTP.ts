import { toast } from "sonner";
import axiosInstance from "../axios";

function requestOTP(email: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosInstance.post("/auth/request-otp", {
        email,
      });

      toast.success("OTP sent successfully");
      resolve(res.data);
    } catch (err: any) {
      console.error(err, "Error in requestOTP");
      toast.error(err.response?.data?.message || "An error occurred while sending OTP");
      reject(err);
    }
  });
}

export default requestOTP;
