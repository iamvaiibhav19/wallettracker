export interface AccountsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface Account {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
  balance?: number;
}

export interface AccountsResponse {
  accounts: Account[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
