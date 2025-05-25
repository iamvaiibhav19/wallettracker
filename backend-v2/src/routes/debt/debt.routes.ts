import { createDebt, deleteDebt, getDebts, updateDebt } from "controllers/debt/debt.controller";
import { Router } from "express";
import { validateInput } from "middlewares/validateInput";
import { createDebtSchema, updateDebtSchema } from "schemas/debt.schema";

const router = Router();

router.post("/", validateInput(createDebtSchema), createDebt);
router.get("/", getDebts);
router.put("/:id", validateInput(updateDebtSchema), updateDebt);
router.delete("/:id", deleteDebt);

export default router;
