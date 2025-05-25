import axios, { AxiosHeaders } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    withAuth?: boolean;
  }
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 20000,
});

function getAuthToken(): string | null {
  return sessionStorage.getItem("token") || localStorage.getItem("token") || null;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token && (config as any).withAuth) {
    if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }

    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

export default axiosInstance;
