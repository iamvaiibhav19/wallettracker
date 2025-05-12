import { Router } from "express";
import { createTransaction, deleteTransaction, getTransactionById, getTransactions, updateTransaction } from "../../controllers/transaction/transaction.controller";

const router = Router();

// Create Account
router.post("/create", createTransaction);

// Get Account by ID
router.get("/:id", getTransactionById);

// Get All Accounts
router.get("/", getTransactions);

// Update Account
router.put("/:id", updateTransaction);

// Delete Account
router.delete("/:id", deleteTransaction);

export default router;
