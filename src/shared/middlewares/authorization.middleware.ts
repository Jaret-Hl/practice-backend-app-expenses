/**
 * AUTHORIZATION MIDDLEWARE
 * Validates user permissions for protected routes
 * Usage: app.get('/path', authenticateJWT, authorize(['permission.name']), controller)
 */

import { NextFunction, Request, Response } from "express";
import { checkPermissions } from "../../core/security/rbac.service.js";

/**
 * Middleware factory to check if user has required permissions (ALL must match)
 */
export const authorize =
  (requiredPermissions: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userPermissions = req.user.permissions || [];
    const isAdmin = req.user.isAdmin || false;

    const result = checkPermissions(userPermissions, requiredPermissions, isAdmin);

    if (!result.hasPermission) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: result.reason,
        requiredPermissions,
        userPermissions,
      });
    }

    next();
  };

/**
 * Middleware factory to check if user has at least ONE of the required permissions
 */
export const authorizeAny =
  (requiredPermissions: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userPermissions = req.user.permissions || [];
    const isAdmin = req.user.isAdmin || false;

    const hasAnyPermission = isAdmin ||
      requiredPermissions.some((perm) => userPermissions.includes(perm));

    if (!hasAnyPermission) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: `Se requiere uno de los siguientes permisos: ${requiredPermissions.join(", ")}`,
        requiredPermissions,
        userPermissions,
      });
    }

    next();
  };

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: "Acceso denegado",
      message: "Se requiere rol de administrador",
    });
  }

  next();
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole =
  (requiredRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: `Se requiere uno de los siguientes roles: ${requiredRoles.join(", ")}`,
        requiredRoles,
        userRoles,
      });
    }

    next();
  };
