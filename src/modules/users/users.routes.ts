import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../users/users.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { checkPermission } from "../../shared/middlewares/permission.middleware.js";
import {
  UserCreateSchema,
  UserUpdateSchema,
} from "./users.schema.js";

import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

router.get(
  "/users",
  authenticateJWT,
  authorize([PERMISSIONS.USER_READ]),
  getUsers,
);

router.get(
  "/users/:id",
  authenticateJWT,
  authorize([PERMISSIONS.USER_READ]),
  getUserById,
);

router.post(
  "/users",
  authenticateJWT,
  authorize([PERMISSIONS.USER_CREATE]),
  validate(UserCreateSchema),
  createUser,
);

router.put(
  "/users/:id",
  authenticateJWT,
  authorize([PERMISSIONS.USER_UPDATE]),
  validate(UserUpdateSchema),
  updateUser,
);

router.delete(
  "/users/:id",
  authenticateJWT,
  authorize([PERMISSIONS.USER_DELETE]),
  deleteUser,
);

export default router;
