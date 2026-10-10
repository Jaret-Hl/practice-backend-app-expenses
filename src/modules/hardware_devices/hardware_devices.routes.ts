import { Router } from "express";

import { getHardwareDevices } from "../hardware_devices/hardware_devices.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// integrar schema
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

router.get(
  "/hardware-devices",
  authenticateJWT,
  authorize([PERMISSIONS.HARDWARE_DEVICES_READ]),
  getHardwareDevices,
);

export default router;