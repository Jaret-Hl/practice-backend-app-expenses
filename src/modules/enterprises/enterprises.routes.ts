import { Router } from "express";
import {
  getEnterprises,
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  getEnterpriseFacets,
} from "../enterprises/enterprises.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { checkPermission } from "../../shared/middlewares/permission.middleware.js";
import {
  EnterpriseCreateSchema,
  EnterpriseUpdateSchema,
} from "./enterprises.schema.js";

import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

import riskRatesRoutes from "./submodules/enterprise-risk-rate/enterprise-risk-rate.routes.js";

const router = Router();

router.get(
  "/enterprises",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  getEnterprises,
);

router.get(
  "/enterprises/facets",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  getEnterpriseFacets,
);

router.get(
  "/enterprises/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  getEnterpriseById,
);

router.post(
  "/enterprises",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_CREATE]),
  validate(EnterpriseCreateSchema),
  createEnterprise,
);

router.put(
  "/enterprises/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_UPDATE]),
  validate(EnterpriseUpdateSchema),
  updateEnterprise,
);

router.delete(
  "/enterprises/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_DELETE]),
  deleteEnterprise,
);

router.use('/enterprises/:enterpriseId/risk-rate', riskRatesRoutes)

export default router;
