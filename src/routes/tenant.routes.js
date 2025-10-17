import { Router } from "express";
import { getTenants, getTenantById, updateTenant, deleteTenant } from "../controllers/tenants.controller.js";

const router = Router();

router.get("/tenants", getTenants);

router.get("/tenants/:id", getTenantById);

router.put("/tenants/:id", updateTenant);

router.delete("/tenants/:id", deleteTenant);
export default router;
