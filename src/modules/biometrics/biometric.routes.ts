import { Router } from "express";
import {
  getBiometrics,
  getBiometricById,
  updateBiometric,
  deleteBiometric,
  createBiometric,
} from "../biometrics/biometrics.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  BiometricCreateSchema,
  BiometricUpdateSchema,
} from "./biometrics.schema.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

router.get(
  "/biometrics",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_READ]),
  getBiometrics,
);

router.get(
  "/biometrics/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_READ]),
  getBiometricById,
);

router.post(
  "/biometrics",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_CREATE]),
  validate(BiometricCreateSchema),
  createBiometric,
);

router.put(
  "/biometrics/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_UPDATE]),
  validate(BiometricUpdateSchema),
  updateBiometric,
);

router.delete(
  "/biometrics/:id",
  authenticateJWT,
  authorize([PERMISSIONS.BIOMETRIC_DELETE]),
  deleteBiometric,
);

export default router;
