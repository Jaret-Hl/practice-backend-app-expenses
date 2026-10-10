import { Router } from "express";
import {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} from "../persons/persons.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { PersonCreateSchema, PersonUpdateSchema } from "./persons.schema.js";

const router = Router();

router.get(
  "/persons",
  authenticateJWT,
  authorize([PERMISSIONS.PERSON_READ]),
  getPersons,
);

router.get(
  "/persons/:id",
  authenticateJWT,
  authorize([PERMISSIONS.PERSON_READ]),
  getPersonById,
);

router.post(
  "/persons",
  authenticateJWT,
  authorize([PERMISSIONS.PERSON_CREATE]),
  validate(PersonCreateSchema),
  createPerson,
);

router.put(
  "/persons/:id",
  authenticateJWT,
  authorize([PERMISSIONS.PERSON_UPDATE]),
  validate(PersonUpdateSchema),
  updatePerson,
);

router.delete(
  "/persons/:id",
  authenticateJWT,
  authorize([PERMISSIONS.PERSON_DELETE]),
  deletePerson,
);

export default router;
