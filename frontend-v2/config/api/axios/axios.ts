import type { AxiosResponse } from "axios";
import axios, { AxiosError } from "axios";

interface axiosInstanceConfig {
  baseURL: string;
  headers: {
    "Content-Type": string;
    accept: string;
  };
  timeout: number;
  withCredentials: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  message: string | null;
  error: string | null;
  status: number;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 20000,
  // withCredentials: true,
} as axiosInstanceConfig);

export default axiosInstance;

function getAuthToken(): string | null {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) {
    console.error("Auth token not found in cookies");
  }
  return token;
}

async function handleRequest<T>(
  requestPromise: Promise<AxiosResponse<T>>,
  setLoading?: (loading: boolean) => void,
  customError?: { message: string; status: number }
): Promise<ApiResponse<T>> {
  setLoading?.(true);
  try {
    if (customError) {
      throw new Error(customError.message);
    }
    const response = await requestPromise;
    setLoading?.(false);
    const responseData = response.data as { data: T; message: string };

    return {
      data: responseData.data,
      message: responseData.message,
      error: null,
      status: response.status,
    };
  } catch (error) {
    setLoading?.(false);
    if (customError) {
      return {
        data: null,
        message: null,
        error: customError.message,
        status: customError.status,
      };
    }
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const errorMessage =
        axiosError.response?.data && typeof axiosError.response.data === "object" && "message" in axiosError.response.data
          ? (axiosError.response.data as { message: string }).message
          : axiosError.message;
      return {
        data: null,
        message: null,
        error: errorMessage,
        status: axiosError.response?.status || 500,
      };
    }
    return {
      data: null,
      message: null,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
}

export async function getRequest<T>(URL: string, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  return handleRequest<T>(axiosInstance.get<T>(`/${URL}`), setLoading);
}

export async function postRequest<T>(URL: string, payload: any, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  return handleRequest<T>(axiosInstance.post<T>(`/${URL}`, payload), setLoading);
}

export async function patchRequest<T>(URL: string, payload: any, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  return handleRequest<T>(axiosInstance.patch<T>(`/${URL}`, payload), setLoading);
}

export async function deleteRequest<T>(URL: string, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  return handleRequest<T>(axiosInstance.delete<T>(`/${URL}`), setLoading);
}

// Authorized request functions
export async function GET<T>(URL: string, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  if (!token) {
    return handleRequest<T>(Promise.reject(), setLoading, {
      message: "Authorization token not found",
      status: 401,
    });
  }
  return handleRequest<T>(
    axiosInstance.get<T>(URL, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    setLoading
  );
}

export async function POST<T>(URL: string, payload: any, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  if (!token) {
    return handleRequest<T>(Promise.reject(), setLoading, {
      message: "Authorization token not found",
      status: 401,
    });
  }
  return handleRequest<T>(
    axiosInstance.post<T>(URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    setLoading
  );
}

export async function PATCH<T>(URL: string, payload: any, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  if (!token) {
    return handleRequest<T>(Promise.reject(), setLoading, {
      message: "Authorization token not found",
      status: 401,
    });
  }
  return handleRequest<T>(
    axiosInstance.patch<T>(URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    setLoading
  );
}

export async function PUT<T>(URL: string, payload: any, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  if (!token) {
    return handleRequest<T>(Promise.reject(), setLoading, {
      message: "Authorization token not found",
      status: 401,
    });
  }
  return handleRequest<T>(
    axiosInstance.put<T>(URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    setLoading
  );
}

export async function DELETE<T>(URL: string, setLoading?: (loading: boolean) => void): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  if (!token) {
    return handleRequest<T>(Promise.reject(), setLoading, {
      message: "Authorization token not found",
      status: 401,
    });
  }
  return handleRequest<T>(
    axiosInstance.delete<T>(`/${URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    setLoading
  );
}
