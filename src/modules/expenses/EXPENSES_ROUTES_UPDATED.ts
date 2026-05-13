/**
 * EXPENSES ROUTES - RBAC UPDATED VERSION
 * 
 * Reemplaza el contenido de src/modules/expenses/expenses.routes.ts
 */

import { Router } from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  // Agrega aquí otros controladores si existen
} from "./expenses.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { ExpenseCreateSchema, ExpenseUpdateSchema } from "./expenses.schema.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

/**
 * GET /expenses - List all expenses
 * Requires: expense.list permission
 */
router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_LIST]),
  getExpenses
);

/**
 * GET /expenses/:id - Get expense by ID
 * Requires: expense.read permission
 */
router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_READ]),
  getExpenseById
);

/**
 * POST /expenses - Create new expense
 * Requires: expense.create permission
 */
router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_CREATE]),
  validate(ExpenseCreateSchema),
  createExpense
);

/**
 * PUT /expenses/:id - Update expense
 * Requires: expense.update permission
 */
router.put(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_UPDATE]),
  validate(ExpenseUpdateSchema),
  updateExpense
);

/**
 * PATCH /expenses/:id - Partial update expense
 * Requires: expense.update permission
 */
router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_UPDATE]),
  validate(ExpenseUpdateSchema),
  updateExpense
);

/**
 * DELETE /expenses/:id - Delete expense
 * Requires: expense.delete permission
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.EXPENSE_DELETE]),
  deleteExpense
);

/**
 * PATCH /expenses/:id/approve - Approve expense
 * Requires: expense.approve permission
 * (Si existe este endpoint en tu controlador)
 */
// router.patch(
//   "/:id/approve",
//   authenticateJWT,
//   authorize([PERMISSIONS.EXPENSE_APPROVE]),
//   approveExpense
// );

export default router;
