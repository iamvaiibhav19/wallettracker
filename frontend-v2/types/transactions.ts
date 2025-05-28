export interface TransactionsFilters {
  category?: string;
  label?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionsParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
  isExport?: boolean | string;
  filters?: TransactionsFilters;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  categoryId: string;
  accountId: string;
  userId: string;
  targetName: string | null;
  reminderDate: string | null;
  destinationAccountId: string | null;
  debtId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
