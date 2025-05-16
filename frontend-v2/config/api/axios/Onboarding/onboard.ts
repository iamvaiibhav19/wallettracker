import { toast } from "sonner";
import axiosInstance from "../axios";

function onboardUser(payload: { currency: string; bankName: string; type: string; balance: number }) {
  return new Promise(async (resolve, reject) => {
    const { currency, bankName, type, balance } = payload;

    if (!currency || !bankName || !type || !balance) {
      toast.error("All fields are required");
      return reject(new Error("All fields are required"));
    }

    const token = sessionStorage.getItem("token");

    try {
      const res = await axiosInstance.post(
        "/user/onboard",
        {
          currency,
          bankName,
          type,
          balance: Number(balance),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Onboarding successful");
      resolve(res.data);
    } catch (err: any) {
      console.error(err, "Error in onboardUser");
      toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred during onboarding");
      reject(err);
    }
  });
}

export default onboardUser;
