/**
 * QUOTES ROUTES - RBAC UPDATED VERSION
 * 
 * Reemplaza el contenido de src/modules/quotes/quotes.routes.ts
 */

import { Router } from "express";
import {
  getQuotes,
  getQuotesById,
  createQuotes,
  updateQuotes,
  deleteQuotes,
} from "./quotes.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { QuoteCreateSchema, QuoteUpdateSchema } from "./quotes.schema.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

/**
 * GET /quotes - List all quotes
 * Requires: quote.list permission
 */
router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_LIST]),
  getQuotes
);

/**
 * GET /quotes/:id - Get quote by ID
 * Requires: quote.read permission
 */
router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_READ]),
  getQuotesById
);

/**
 * POST /quotes - Create new quote
 * Requires: quote.create permission
 */
router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_CREATE]),
  validate(QuoteCreateSchema),
  createQuotes
);

/**
 * PUT /quotes/:id - Update quote
 * Requires: quote.update permission
 */
router.put(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_UPDATE]),
  validate(QuoteUpdateSchema),
  updateQuotes
);

/**
 * PATCH /quotes/:id - Partial update quote
 * Requires: quote.update permission
 */
router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_UPDATE]),
  validate(QuoteUpdateSchema),
  updateQuotes
);

/**
 * DELETE /quotes/:id - Delete quote
 * Requires: quote.delete permission
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.QUOTE_DELETE]),
  deleteQuotes
);

export default router;
