import { Router } from "express";
import { getEnterprises, getEnterpriseById, createEnterprise, updateEnterprise, deleteEnterprise } from "../enterprises/enterprises.controller.js";

const router = Router();

router.get("/enterprises", getEnterprises);
router.get("/enterprises/:id", getEnterpriseById);
router.post("/enterprises", createEnterprise);
router.put("/enterprises/:id", updateEnterprise);
router.delete("/enterprises/:id", deleteEnterprise);

export default router;
 