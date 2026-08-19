import { Router } from "express";
import {
  getEnterprisesRiskRate,
  getEnterpriseRiskRateById,
} from "../enterprise-risk-rate/enterprise-risk-rate.controller.js";
import { validate } from "../../../../shared/middlewares/validate.middleware.js";
import { checkPermission } from "../../../../shared/middlewares/permission.middleware.js";
import {
  EnterpriseCreateSchema,
  EnterpriseUpdateSchema,
} from "../enterprise-risk-rate/enterprise-risk-rate.schema.js";

import { authenticateJWT } from "../../../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../../../shared/constants/permissions.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.RISKRATE_READ]),
  getEnterprisesRiskRate,
);

router.get(
  "/:riskRateId",
  authenticateJWT,
  authorize([PERMISSIONS.RISKRATE_READ]),
  getEnterpriseRiskRateById,
);

export default router;
