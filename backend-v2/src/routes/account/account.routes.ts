import { createAccount, deleteAccount, getAccountById, getAccounts, updateAccount } from "../../controllers/account/account.controller";
import { Router } from "express";

const router = Router();

// Create Account
router.post("/create", createAccount);

// Get Account by ID
router.get("/:id", getAccountById);

// Get All Accounts
router.get("/", getAccounts);

// Update Account
router.put("/:id", updateAccount);

// Delete Account
router.delete("/:id", deleteAccount);

export default router;
