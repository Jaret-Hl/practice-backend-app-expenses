import { Router } from "express";
import {
  assignRoleToUser,
  removeRoleFromUser,
  assignPermissionToRole,
  removePermissionFromRole,
} from "./rbac.controller.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const router = Router();

// Proteger todas las rutas RBAC con autenticación y permisos específicos
const rbacAdminMiddleware = [
  authenticateJWT,
  authorize([PERMISSIONS.RBAC_ASSIGN_ROLES]),
];

// Asignaciones de roles a usuarios
router.post(
  "/users/:userId/roles/:roleId",
  rbacAdminMiddleware,
  assignRoleToUser,
);

router.delete(
  "/users/:userId/roles/:roleId",
  rbacAdminMiddleware,
  removeRoleFromUser,
);

// Asignaciones de permisos a roles
router.post(
  "/roles/:roleId/permissions/:permissionId",
  rbacAdminMiddleware,
  assignPermissionToRole,
);

router.delete(
  "/roles/:roleId/permissions/:permissionId",
  rbacAdminMiddleware,
  removePermissionFromRole,
);

export default router;
