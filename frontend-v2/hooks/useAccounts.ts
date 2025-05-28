import { getAllAccounts } from "@/config/api/axios/Accounts/getAccounts";
import { AccountsParams } from "@/types/accounts";
import { useQuery } from "@tanstack/react-query";

export const useAccounts = (params: AccountsParams = {}) => {
  return useQuery({
    queryKey: ["accounts", params],
    queryFn: () => getAllAccounts(params),
  });
};
