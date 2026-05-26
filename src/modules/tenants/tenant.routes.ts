import { Router } from "express";
import {
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  createTenant,
} from "../tenants/tenants.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { TenantCreateSchema, TenantUpdateSchema } from "./tenants.schema.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();
router.get(
  "/tenants",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_READ]),
  getTenants,
);

router.get(
  "/tenants/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_READ]),
  getTenantById,
);

router.post(
  "/tenants",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_CREATE]),
  validate(TenantCreateSchema),
  createTenant,
);

router.put(
  "/tenants/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_UPDATE]),
  validate(TenantUpdateSchema),
  updateTenant,
);

router.delete(
  "/tenants/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_DELETE]),
  deleteTenant,
);

export default router;
