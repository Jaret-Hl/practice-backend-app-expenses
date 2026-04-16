import { Router } from "express";
import { getTenants, getTenantById, updateTenant, deleteTenant, createTenant } from "../tenants/tenants.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.get("/tenants", authMiddleware, getTenants);

router.get("/tenants/:id", authMiddleware, getTenantById);

router.post("/tenants", authMiddleware, createTenant);

router.put("/tenants/:id", authMiddleware, updateTenant);

router.delete("/tenants/:id", authMiddleware, deleteTenant);
export default router;
