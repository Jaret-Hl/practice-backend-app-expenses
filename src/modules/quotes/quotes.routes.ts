import { Router } from "express";
import { getQuotes, getQuotesById, updateQuotes, deleteQuotes, createQuotes } from "../quotes/quotes.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { QuoteCreateSchema, QuoteUpdateSchema } from "./quotes.schema.js";

const router = Router();

router.get("/quotes", authMiddleware, getQuotes);

router.get("/quotes/:id", authMiddleware, getQuotesById);

router.post("/quotes", authMiddleware, validate(QuoteCreateSchema), createQuotes);

router.put("/quotes/:id", authMiddleware, validate(QuoteUpdateSchema), updateQuotes);

router.delete("/quotes/:id", authMiddleware, deleteQuotes);

export default router;
