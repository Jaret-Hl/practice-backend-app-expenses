import { Router } from "express";
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from "../expenses/expenses.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { ExpenseCreateSchema, ExpenseUpdateSchema } from "./expenses.schema.js";

const router = Router();

router.get("/expenses", getExpenses);

router.get("/expenses/:id", getExpenseById);

router.post("/expenses", validate(ExpenseCreateSchema), createExpense);

router.put("/expenses/:id", validate(ExpenseUpdateSchema), updateExpense);

router.delete("/expenses/:id", deleteExpense);

export default router;
