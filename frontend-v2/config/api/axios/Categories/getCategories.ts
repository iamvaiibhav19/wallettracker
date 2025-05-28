import { toast } from "sonner";
import axiosInstance from "../axios";
import { CategoriesParams, CategoriesResponse } from "@/types/categories";

async function getAllCategories(params: CategoriesParams = {}): Promise<CategoriesResponse> {
  try {
    const response = await axiosInstance.get("/categories", {
      withAuth: true,
      params,
    });

    return response.data;
  } catch (err: any) {
    console.error("Error fetching categories", err);
    toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to fetch categories");
    throw err;
  }
}

async function exportCategories(params: CategoriesParams = {}): Promise<Blob> {
  try {
    const response = await axiosInstance.get("/categories", {
      withAuth: true,
      params,
      responseType: "blob",
    });
    return response.data;
  } catch (err: any) {
    console.error("Error exporting categories", err);
    throw err;
  }
}

export { getAllCategories, exportCategories };
