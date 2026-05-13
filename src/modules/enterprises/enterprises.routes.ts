import { Router } from "express";
import { getEnterprises, getEnterpriseById, createEnterprise, updateEnterprise, deleteEnterprise } from "../enterprises/enterprises.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { checkPermission } from "../../shared/middlewares/permission.middleware.js";
import { EnterpriseCreateSchema, EnterpriseUpdateSchema } from "./enterprises.schema.js";

const router = Router();

// Rutas de solo lectura - cualquier usuario autenticado puede ver
router.get("/enterprises", getEnterprises);
router.get("/enterprises/:id", getEnterpriseById);

// Rutas que requieren permisos específicos
router.post("/enterprises", checkPermission("enterprises", "create"), validate(EnterpriseCreateSchema), createEnterprise);
router.put("/enterprises/:id", checkPermission("enterprises", "update"), validate(EnterpriseUpdateSchema), updateEnterprise);
router.delete("/enterprises/:id", checkPermission("enterprises", "delete"), deleteEnterprise);

export default router;
 