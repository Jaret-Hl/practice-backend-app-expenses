import { Router } from "express";
import { getTenants, getTenantById, updateTenant, deleteTenant, createTenant } from "../tenants/tenants.controller.js";

const router = Router();

router.get("/tenants", getTenants);

router.get("/tenants/:id", getTenantById);

router.post("/tenants", createTenant);

router.put("/tenants/:id", updateTenant);

router.delete("/tenants/:id", deleteTenant);
export default router;
