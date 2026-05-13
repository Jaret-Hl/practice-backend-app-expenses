/**
 * BIOMETRICS ROUTES - RBAC UPDATED VERSION
 * 
 * Reemplaza el contenido de src/modules/biometrics/biometric.routes.ts
 */

import { Router } from "express";
import {
  getBiometrics,
  getBiometricById,
  createBiometric,
  updateBiometric,
  deleteBiometric,
} from "./biometrics.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { BiometricBaseSchema } from "./biometrics.schema.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

/**
 * GET /biometrics - List all biometrics
 * Requires: biometric.read permission
 */
router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_READ]),
  getBiometrics
);

/**
 * GET /biometrics/:id - Get biometric by ID
 * Requires: biometric.read permission
 */
router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_READ]),
  getBiometricById
);

/**
 * POST /biometrics - Create new biometric
 * Requires: biometric.create permission
 */
router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_CREATE]),
  validate(BiometricBaseSchema),
  createBiometric
);

/**
 * PUT /biometrics/:id - Update biometric
 * Requires: biometric.update permission
 */
router.put(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_UPDATE]),
  validate(BiometricBaseSchema),
  updateBiometric
);

/**
 * PATCH /biometrics/:id - Partial update biometric
 * Requires: biometric.update permission
 */
router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_UPDATE]),
  validate(BiometricBaseSchema),
  updateBiometric
);

/**
 * DELETE /biometrics/:id - Delete biometric
 * Requires: biometric.delete permission
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_DELETE]),
  deleteBiometric
);

export default router;
