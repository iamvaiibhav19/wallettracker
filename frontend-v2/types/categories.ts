export interface CategoriesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
