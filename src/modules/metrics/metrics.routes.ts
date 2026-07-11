import { Router } from "express";
import { getOverviewMetrics } from "./metrics.controller.js";

const router = Router();

router.get("/metrics/overview", getOverviewMetrics);

export default router;