import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense", "transfer", "lend"]),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime(),
  accountId: z.string().uuid(),
  destinationAccountId: z.string().uuid().optional(),
  targetName: z.string().optional(),
  reminderDate: z.string().datetime().optional(),
});
