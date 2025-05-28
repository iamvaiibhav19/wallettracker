import { Router } from "express";
import {
  createTransaction,
  deleteAllTransactions,
  deleteTransaction,
  deleteTransactions,
  getTransactionById,
  getTransactionHeatmap,
  getTransactions,
  updateTransaction,
} from "../../controllers/transaction/transaction.controller";
import { validateInput } from "../../middlewares/validateInput";
import { createTransactionSchema } from "../../schemas/transaction.schema";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Create Transaction
router.post("/create", authenticate, validateInput(createTransactionSchema), createTransaction);

// Get Transaction Heatmap
router.get("/heatmap", authenticate, getTransactionHeatmap);

// Get Transaction by ID
router.get("/:id", authenticate, getTransactionById);

// Get All Transactions
router.get("/", authenticate, getTransactions);

// Update Transaction by ID
router.put("/:id", authenticate, validateInput(createTransactionSchema), updateTransaction);

// Delete Transaction by ID
router.delete("/:id", authenticate, deleteTransaction);

// Delete Multiple Transactions
router.delete("/delete/multiple", authenticate, deleteTransactions);

// Delete All Transactions
router.delete("/delete/all", authenticate, deleteAllTransactions);

export default router;
