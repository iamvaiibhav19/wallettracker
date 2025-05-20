import { createBudget, deleteBudget, getBudgets, updateBudget } from "../../controllers/budget/budget.controller";
import { Router } from "express";

const router = Router();

// Create a new budget
router.post("/", createBudget);

// Get all budgets for the user
router.get("/", getBudgets);

// Update a budget by ID
router.put("/:id", updateBudget);

// Delete a budget by ID
router.delete("/:id", deleteBudget);

export default router;
