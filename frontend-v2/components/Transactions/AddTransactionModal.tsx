"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { MultiSelect } from "../Common/MultiSelect";
import { useAccounts } from "@/hooks/useAccounts";
import { DateTimePicker } from "../Common/DateTimePicker";
import { useCategories } from "@/hooks/useCategories";
import addTransaction from "@/config/api/axios/Transactions/addTransaction";
import getTransactionById from "@/config/api/axios/Transactions/getTransactionById";
import updateTransaction from "@/config/api/axios/Transactions/updateTransaction";

const typeOptions = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
  { label: "Transfer", value: "transfer" },
  { label: "Lend", value: "lend" },
];

// Zod schema for transaction validation
const transactionSchema = z
  .object({
    amount: z.coerce.number().positive("Amount must be positive"),
    type: z.enum(["income", "expense", "transfer", "lend"]),
    accountId: z.string().min(1, "Account is required"),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    destinationAccountId: z.string().optional(),
    targetName: z.string().optional(),
    reminderDate: z.string().optional(),
    date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return (data.destinationAccountId ?? "").trim().length > 0;
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
        return (data.reminderDate ?? "").trim().length > 0;
      }
      return true;
    },
    {
      message: "Reminder Date is required for Lend",
      path: ["reminderDate"],
    }
  );

type TransactionFormValues = z.infer<typeof transactionSchema>;

// Helper component for red asterisk in labels
function RequiredMark() {
  return <span className="text-red-600 ml-1">*</span>;
}

export function AddTransactionModal({
  onSuccess,
  editTransactionId,
  onCloseEdit,
}: {
  onSuccess?: () => void;
  editTransactionId?: string;
  onCloseEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: "expense",
      accountId: "",
      categoryId: "",
      description: "",
      destinationAccountId: "",
      targetName: "",
      reminderDate: "",
      date: new Date().toISOString(),
    },
  });

  const type = form.watch("type");

  const params = {};

  const { data: AccountsData, isLoading: isAccountsLoading } = useAccounts(params);
  const { data: categoryData, isLoading: isCategoriesLoading } = useCategories(params);

  const accountOptions =
    AccountsData?.accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })) || [];

  const categoryOptions =
    categoryData?.categories.map((category) => ({
      label: category.name,
      value: category.id,
    })) || [];

  async function onSubmit(data: TransactionFormValues) {
    if (data.type !== "transfer") {
      delete data.destinationAccountId;
    }
    if (data.type !== "lend") {
      delete data.targetName;
      delete data.reminderDate;
    }

    if (data.type !== "expense") {
      delete data.categoryId;
    }

    try {
      setIsSubmitting(true);
      if (editTransactionId) {
        await updateTransaction({ id: editTransactionId, ...data });
      } else {
        await addTransaction(data);
      }
      setOpen(false);

      form.reset({
        amount: 0,
        type: "expense",
        accountId: "",
        categoryId: "",
        description: "",
        destinationAccountId: "",
        targetName: "",
        reminderDate: "",
        date: new Date().toISOString(),
      });

      setIsSubmitting(false);

      onSuccess?.();
      onCloseEdit?.();
    } catch (error) {
      setIsSubmitting(false);
      console.error("Transaction submit failed", error);
    }
  }

  useEffect(() => {
    if (editTransactionId) {
      (async () => {
        try {
          setOpen(true);
          const data = await getTransactionById({ id: editTransactionId });

          console.log("Fetched transaction for edit:", data);
          // clear any previous form state
          form.reset({
            amount: data.amount,
            type: data.type,
            accountId: data.accountId,
            categoryId: data.categoryId || "",
            description: data.description || "",
            destinationAccountId: data.destinationAccountId || "",
            targetName: data.targetName || "",
            reminderDate: data.reminderDate || "",
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [editTransactionId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(set) => {
        setOpen(set);
        if (!set && onCloseEdit) {
          onCloseEdit();
        }
      }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex bg-brand-dark text-white hover:bg-brand-dark hover:text-white items-center gap-0.5 transition duration-200 ease-in-out cursor-pointer w-full sm:w-auto"
          onClick={() => {
            setOpen(true);
            form.reset({
              amount: 0,
              type: "expense",
              accountId: "",
              categoryId: "",
              description: "",
              destinationAccountId: "",
              targetName: "",
              reminderDate: "",
              date: new Date().toISOString(),
            });
          }}>
          <PlusCircle className="inline mr-2" />
          {editTransactionId ? "Edit Transaction" : "Add Transaction"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95%] sm:max-w-md md:max-w-xl lg:max-w-2xl">
        <DialogHeader className="mb-4 border-b-2 pb-4">
          <DialogTitle className="text-brand-dark">{editTransactionId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {editTransactionId ? "Update the details of this transaction." : "Fill in the details below to add a new transaction."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[60vh] md:max-h-[80vh] overflow-y-auto">
            {/* Account ID */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Choose Account
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    {isAccountsLoading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Loading accounts...
                      </div>
                    ) : (
                      <MultiSelect
                        isMulti={false}
                        options={accountOptions}
                        defaultValue={field.value ? [field.value] : []}
                        onValueChange={(val) => field.onChange(val[0] || "")}
                        maxCount={1}
                        animation={0}
                        variant="default"
                        placeholder="Select account"
                      />
                    )}
                  </FormControl>
                  <FormDescription>Select the account where this transaction will be recorded.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      isMulti={false}
                      options={typeOptions}
                      defaultValue={[field.value]}
                      onValueChange={(val) => field.onChange(val[0] || "")}
                      maxCount={1}
                      animation={0}
                      variant="default"
                      placeholder="Select type"
                    />
                  </FormControl>
                  <FormDescription>Select the transaction type.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100.00" {...field} />
                  </FormControl>
                  <FormDescription>Enter the amount of money for this transaction. Must be positive.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destination Account ID - Required if Transfer */}
            {type === "transfer" && (
              <FormField
                control={form.control}
                name="destinationAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Destination Account
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        isMulti={false}
                        options={accountOptions}
                        defaultValue={field.value ? [field.value] : []}
                        onValueChange={(val) => field.onChange(val[0] || "")}
                        maxCount={1}
                        animation={0}
                        variant="default"
                        placeholder="Select destination account"
                      />
                    </FormControl>
                    <FormDescription>Select the account to which money will be transferred.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Category ID - shown for Expense */}
            {type === "expense" && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      {isCategoriesLoading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="animate-spin h-5 w-5" />
                          Loading categories...
                        </div>
                      ) : (
                        <MultiSelect
                          isMulti={false}
                          options={categoryOptions}
                          defaultValue={field.value ? [field.value] : []}
                          onValueChange={(val) => field.onChange(val[0] || "")}
                          maxCount={1}
                          animation={0}
                          variant="default"
                          placeholder="Select category"
                        />
                      )}
                    </FormControl>
                    <FormDescription>Select a category to classify this transaction.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries, Rent, etc." {...field} />
                  </FormControl>
                  <FormDescription>Optional description of the transaction.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Name and Reminder Date - Required only for Lend */}
            {type === "lend" && (
              <>
                <FormField
                  control={form.control}
                  name="targetName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Name
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Vendor or Person Name" {...field} />
                      </FormControl>
                      <FormDescription>Name of the person or entity you are lending to.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Reminder Date
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => {
                            field.onChange(date ? date.toISOString() : "");
                          }}
                        />
                      </FormControl>
                      <FormDescription>Date to remind you about the lend repayment.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Transaction Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        field.onChange(date ? date.toISOString() : "");
                      }}
                    />
                  </FormControl>
                  <FormDescription>Date and time when the transaction occurred.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-between items-center gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-dark text-white hover:bg-brand-dark hover:text-white transition duration-200 ease-in-out">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Submitting...
                  </div>
                ) : editTransactionId ? (
                  "Update Transaction"
                ) : (
                  "Add Transaction"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
