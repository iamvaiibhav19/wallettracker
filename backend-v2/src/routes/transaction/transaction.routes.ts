import { Router } from "express";
import {
  createTransaction,
  deleteAllTransactions,
  deleteTransaction,
  deleteTransactions,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../../controllers/transaction/transaction.controller";
import { validateInput } from "../../middlewares/validateInput";
import { createTransactionSchema } from "../../schemas/transaction.schema";

const router = Router();

// Create Transaction
router.post("/create", validateInput(createTransactionSchema), createTransaction);

// Get Transaction by ID
router.get("/:id", getTransactionById);

// Get All Transactions
router.get("/", getTransactions);

// Update Transaction by ID
router.put("/:id", updateTransaction);

// Delete Transaction by ID
router.delete("/:id", deleteTransaction);

// Delete Multiple Transactions
router.delete("/delete/multiple", deleteTransactions);

// Delete All Transactions
router.delete("/delete/all", deleteAllTransactions);

export default router;
