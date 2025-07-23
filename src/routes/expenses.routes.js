import { Router } from "express";
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from "../controllers/expenses.controller.js";

const router = Router();

router.get("/expenses", getExpenses);

router.get("/expenses/:id", getExpenseById);

router.post("/expenses", createExpense);

router.put("/expenses/:id", updateExpense);

router.delete("/expenses/:id", deleteExpense);

export default router;
