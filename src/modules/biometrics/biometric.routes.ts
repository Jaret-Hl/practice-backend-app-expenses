import { Router } from "express";
import { getBiometrics, getBiometricById, updateBiometric, deleteBiometric, createBiometric } from "../biometrics/biometrics.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { BiometricCreateSchema, BiometricUpdateSchema } from "./biometrics.schema.js";

const router = Router();

router.get("/biometrics", authMiddleware, getBiometrics);

router.get("/biometrics/:id", authMiddleware, getBiometricById);

router.post("/biometrics", authMiddleware, validate(BiometricCreateSchema), createBiometric);

router.put("/biometrics/:id", authMiddleware, validate(BiometricUpdateSchema), updateBiometric);

router.delete("/biometrics/:id", authMiddleware, deleteBiometric);
export default router;
