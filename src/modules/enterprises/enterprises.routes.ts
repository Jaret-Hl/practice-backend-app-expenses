import { Router } from "express";
import { getEnterprise, getEnterpriseById } from "../enterprises/enterprises.controller.js";

const router = Router();

router.get("/enterprises", getEnterprise);
router.get("/enterprises/:id", getEnterpriseById);

export default router;
