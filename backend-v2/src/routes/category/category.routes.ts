import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getTransactionsByCategory,
  updateCategory,
} from "../../controllers/category/category.controller";

const router = Router();

// Create Category
router.post("/create", createCategory);

// Get All Transactions
router.get("/", getCategories);

// Update Transaction by ID
router.put("/:id", updateCategory);

// Delete Transaction by ID
router.delete("/:id", deleteCategory);

// Get Transactions by Category
router.get("/:categoryId/transactions", getTransactionsByCategory);

export default router;
