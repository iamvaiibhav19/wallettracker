import { toast } from "sonner";
import axiosInstance from "../axios";

function getUserInfo() {
  return new Promise(async (resolve, reject) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return reject(new Error("User not authenticated"));
    }

    try {
      const res = await axiosInstance.get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      resolve(res.data);
    } catch (err: any) {
      console.error(err, "Error in getUserInfo");
      toast.error(err.response?.data?.message || err.response?.data?.error || "An error occurred while fetching user info");
      reject(err);
    }
  });
}

export default getUserInfo;
