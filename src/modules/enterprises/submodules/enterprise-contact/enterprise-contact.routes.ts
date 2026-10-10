import { Router } from "express";
import {
  getEnterpriseContacts,
  createEnterpriseContact,
  deleteEnterpriseContact,
} from "../enterprise-contact/enterprise-contact.controller.js";
import { validate } from "../../../../shared/middlewares/validate.middleware.js";
import { authenticateJWT } from "../../../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../../../shared/constants/permissions.js";
import { EnterpriseContactCreateSchema } from "../enterprise-contact/enterprise-contact.schema.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.CONTACT_READ]),
  getEnterpriseContacts,
);

router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.CONTACT_CREATE]),
  validate(EnterpriseContactCreateSchema),
  createEnterpriseContact,
);

router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.CONTACT_DELETE]),
  deleteEnterpriseContact,
);

export default router;
