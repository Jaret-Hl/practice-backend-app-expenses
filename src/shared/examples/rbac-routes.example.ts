/**
 * EXAMPLE ROUTES WITH RBAC AUTHORIZATION
 * 
 * Este archivo muestra cómo usar los middlewares de autenticación y autorización
 * en tus rutas. Cópialo y adáptalo a tu proyecto.
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  authorize,
  authorizeAny,
  requireAdmin,
  requireRole,
} from "../middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

/**
 * EJEMPLO 1: Ruta con un permiso específico
 * GET /api/enterprises/:id
 * Solo usuarios con permiso "enterprise.read"
 */
export const enterprisesRouter = Router();

enterprisesRouter.get(
  "/:id",
  authMiddleware,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  // controller.getEnterprise
  (req, res) => {
    res.json({
      message: "Enterprise data",
      userId: req.user?.id,
      userPermissions: req.user?.permissions,
    });
  }
);

/**
 * EJEMPLO 2: Ruta con múltiples permisos (ALL required)
 * POST /api/enterprises
 * Solo usuarios con ambos permisos: enterprise.create Y permisos de editor
 */
enterprisesRouter.post(
  "/",
  authMiddleware,
  authorize([PERMISSIONS.ENTERPRISE_CREATE]),
  // controller.createEnterprise
  (req, res) => {
    res.status(201).json({
      message: "Enterprise created",
      userId: req.user?.id,
    });
  }
);

/**
 * EJEMPLO 3: Ruta con múltiples permisos (ANY required)
 * DELETE /api/enterprises/:id
 * Solo usuarios con al menos uno de estos permisos: manager O admin
 */
enterprisesRouter.delete(
  "/:id",
  authMiddleware,
  authorizeAny([PERMISSIONS.ENTERPRISE_DELETE, PERMISSIONS.TENANT_MANAGE]),
  // controller.deleteEnterprise
  (req, res) => {
    res.json({
      message: "Enterprise deleted",
      userId: req.user?.id,
    });
  }
);

/**
 * EJEMPLO 4: Ruta solo para admins
 * PUT /api/system/settings
 * Solo administradores
 */
export const systemRouter = Router();

systemRouter.put(
  "/settings",
  authMiddleware,
  requireAdmin,
  // controller.updateSettings
  (req, res) => {
    res.json({
      message: "Settings updated",
      admin: req.user?.isAdmin,
    });
  }
);

/**
 * EJEMPLO 5: Ruta con validación de rol
 * GET /api/reports
 * Solo usuarios con rol "manager" O "accountant"
 */
export const reportsRouter = Router();

reportsRouter.get(
  "/",
  authMiddleware,
  requireRole(["manager", "accountant"]),
  // controller.getReports
  (req, res) => {
    res.json({
      message: "Reports data",
      userRoles: req.user?.roles,
    });
  }
);

/**
 * EJEMPLO 6: Ruta con múltiples permisos requeridos
 * PATCH /api/expenses/:id/approve
 * Solo usuarios con permiso para aprobar gastos
 */
export const expensesRouter = Router();

expensesRouter.patch(
  "/:id/approve",
  authMiddleware,
  authorize([PERMISSIONS.EXPENSE_APPROVE]),
  // controller.approveExpense
  (req, res) => {
    res.json({
      message: "Expense approved",
      expenseId: req.params.id,
    });
  }
);

/**
 * EJEMPLO 7: Ruta sin permiso específico (solo autenticado)
 * GET /api/me
 * Solo requiere estar autenticado
 */
export const meRouter = Router();

meRouter.get(
  "/",
  authMiddleware,
  // controller.getProfile
  (req, res) => {
    res.json({
      message: "User profile",
      user: {
        id: req.user?.id,
        email: req.user?.email,
        roles: req.user?.roles,
        permissions: req.user?.permissions,
        isAdmin: req.user?.isAdmin,
      },
    });
  }
);

/**
 * EJEMPLO 8: Combinación de middlewares avanzada
 * POST /api/quotes
 * Admin bypass + permiso OR rol específico
 */
export const quotesRouter = Router();

quotesRouter.post(
  "/",
  authMiddleware,
  authorizeAny([PERMISSIONS.QUOTE_CREATE]),
  // controller.createQuote
  (req, res) => {
    res.json({
      message: "Quote created",
      userId: req.user?.id,
    });
  }
);

/**
 * Patrón completo en tu app/index.ts:
 *
 * import { Router } from 'express';
 * import { authMiddleware } from './shared/middlewares/auth.middleware.js';
 * import { authorize } from './shared/middlewares/authorization.middleware.js';
 * import { PERMISSIONS } from './shared/constants/permissions.js';
 * import * as enterprisesController from './modules/enterprises/enterprises.controller.js';
 *
 * const app = express();
 * const apiRouter = Router();
 *
 * // ✅ Rutas públicas
 * app.post('/api/auth/register', authController.registerUser);
 * app.post('/api/auth/login', authController.loginUser);
 * app.post('/api/auth/refresh', authController.refreshToken);
 *
 * // ✅ Rutas autenticadas
 * apiRouter.get('/me', authMiddleware, authController.getProfile);
 *
 * // ✅ Rutas protegidas por permisos
 * apiRouter.get(
 *   '/enterprises',
 *   authMiddleware,
 *   authorize([PERMISSIONS.ENTERPRISE_LIST]),
 *   enterprisesController.getEnterprises
 * );
 *
 * apiRouter.post(
 *   '/enterprises',
 *   authMiddleware,
 *   authorize([PERMISSIONS.ENTERPRISE_CREATE]),
 *   enterprisesController.createEnterprise
 * );
 *
 * app.use('/api', apiRouter);
 */

export default router;
