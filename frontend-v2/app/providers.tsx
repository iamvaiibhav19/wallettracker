"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import getUserInfo from "@/config/api/axios/Auth/getUserInfo";
import useUserStore, { User } from "@/store/userStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, setUser, clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const res = (await getUserInfo()) as User;

        if (!res) {
          router.replace("/login");
          clearUser();
          return;
        }

        setUser(res);

        console.log("User info fetched successfully:", res);
        // Set user state if needed
      } catch (error) {
        console.error("Error fetching user info:", error);
        router.replace("/login");
      }
    };

    fetchUserInfo();
  }, [router]);
  return <>{children}</>;
}
