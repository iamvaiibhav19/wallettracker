import { getAllCategories } from "@/config/api/axios/Categories/getCategories";
import { CategoriesParams } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

export const useCategories = (params: CategoriesParams = {}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getAllCategories(params),
  });
};
