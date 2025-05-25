import { z } from "zod";

// Base schema for debt, used in both create and update operations
const baseDebtSchema = {
  name: z.string().min(1, "Name is required"),
  principal: z.number().positive("Principal must be a positive number"),
  outstanding: z.number().nonnegative("Outstanding must be zero or positive"),
  monthlyEMI: z.number().nonnegative("Monthly EMI must be zero or positive"),
  interestRate: z.number().nonnegative("Interest rate must be zero or positive"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
};

// Post request schema for creating a new debt
export const createDebtSchema = z.object({
  ...baseDebtSchema,
  endDate: baseDebtSchema.endDate, // optional
  isActive: baseDebtSchema.isActive, // optional
});

// Put request schema for updating an existing debt
export const updateDebtSchema = z.object(
  Object.entries(baseDebtSchema).reduce((acc, [key, schema]) => {
    acc[key] = schema.optional();
    return acc;
  }, {} as Record<string, z.ZodTypeAny>)
);
