/**
 * ENTERPRISES ROUTES - RBAC UPDATED VERSION
 * 
 * Reemplaza el contenido de src/modules/enterprises/enterprises.routes.ts
 * con este código para habilitar RBAC basado en permisos.
 */

import { Router } from "express";
import {
  getEnterprises,
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
} from "./enterprises.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { EnterpriseCreateSchema, EnterpriseUpdateSchema } from "./enterprises.schema.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

/**
 * GET /enterprises - List all enterprises
 * Requires: enterprise.list permission
 */
router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_LIST]),
  getEnterprises
);

/**
 * GET /enterprises/:id - Get enterprise by ID
 * Requires: enterprise.read permission
 */
router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  getEnterpriseById
);

/**
 * POST /enterprises - Create new enterprise
 * Requires: enterprise.create permission
 */
router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_CREATE]),
  validate(EnterpriseCreateSchema),
  createEnterprise
);

/**
 * PUT /enterprises/:id - Update enterprise
 * Requires: enterprise.update permission
 */
router.put(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_UPDATE]),
  validate(EnterpriseUpdateSchema),
  updateEnterprise
);

/**
 * PATCH /enterprises/:id - Partial update enterprise
 * Requires: enterprise.update permission
 */
router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_UPDATE]),
  validate(EnterpriseUpdateSchema),
  updateEnterprise
);

/**
 * DELETE /enterprises/:id - Delete enterprise
 * Requires: enterprise.delete permission
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_DELETE]),
  deleteEnterprise
);

export default router;
