import { toast } from "sonner";
import axiosInstance from "../axios";

interface OnboardPayload {
  currency: string;
  bankName: string;
  type: string;
  balance: number;
}

async function onboardUser(payload: OnboardPayload) {
  const { currency, bankName, type, balance } = payload;

  if (!currency || !bankName || !type || balance === undefined || balance === null) {
    toast.error("All fields are required");
    throw new Error("All fields are required");
  }

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
        withAuth: true,
      }
    );

    toast.success("Onboarding successful");
    return res.data;
  } catch (err: any) {
    console.error("Error in onboardUser", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred during onboarding");
    throw err;
  }
}

export default onboardUser;
