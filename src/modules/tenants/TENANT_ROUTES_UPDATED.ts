/**
 * TENANTS ROUTES - RBAC UPDATED VERSION
 * 
 * Reemplaza el contenido de src/modules/tenants/tenant.routes.ts
 */

import { Router } from "express";
import {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
} from "./tenants.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { TenantBaseSchema } from "./tenants.schema.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

/**
 * GET /tenants - List all tenants
 * Requires: tenant.read permission
 */
router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_READ]),
  getTenants
);

/**
 * GET /tenants/:id - Get tenant by ID
 * Requires: tenant.read permission
 */
router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_READ]),
  getTenantById
);

/**
 * POST /tenants - Create new tenant
 * Requires: tenant.create permission
 */
router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_CREATE]),
  validate(TenantBaseSchema),
  createTenant
);

/**
 * PUT /tenants/:id - Update tenant
 * Requires: tenant.update permission
 */
router.put(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_UPDATE]),
  validate(TenantBaseSchema),
  updateTenant
);

/**
 * PATCH /tenants/:id - Partial update tenant
 * Requires: tenant.update permission
 */
router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_UPDATE]),
  validate(TenantBaseSchema),
  updateTenant
);

/**
 * DELETE /tenants/:id - Delete tenant
 * Requires: tenant.delete permission
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.TENANT_DELETE]),
  deleteTenant
);

export default router;
