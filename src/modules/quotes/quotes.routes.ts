import { Router } from "express";
import { getQuotes, getQuotesById, updateQuotes, deleteQuotes, createQuotes } from "../quotes/quotes.controller.js";

const router = Router();

router.get("/quotes", getQuotes);

router.get("/quotes/:id", getQuotesById);

router.post("/quotes", createQuotes);

router.put("/quotes/:id", updateQuotes);

router.delete("/quotes/:id", deleteQuotes);

export default router;
