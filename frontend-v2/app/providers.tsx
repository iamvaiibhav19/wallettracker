"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
};

export default AuthProvider;
