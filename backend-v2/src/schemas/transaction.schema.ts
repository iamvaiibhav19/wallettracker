import { z } from "zod";

export const createTransactionSchema = z
  .object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["income", "expense", "transfer", "lend"]),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    date: z.string().datetime("Invalid date format"),
    accountId: z.string(),
    destinationAccountId: z.string().optional(),
    targetName: z.string().optional(),
    reminderDate: z.string().datetime("Invalid reminder date format").optional(),
  })
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return !!data.destinationAccountId;
      }
      return true;
    },
    {
      message: "Destination Account is required for Transfer",
      path: ["destinationAccountId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "lend") {
        return (data.targetName ?? "").trim().length > 0;
      }
      return true;
    },
    {
      message: "Target Name is required for Lend",
      path: ["targetName"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "lend") {
        return !!data.reminderDate;
      }
      return true;
    },
    {
      message: "Reminder Date is required for Lend",
      path: ["reminderDate"],
    }
  );
