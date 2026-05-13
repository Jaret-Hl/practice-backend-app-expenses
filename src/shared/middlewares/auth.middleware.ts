import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../../core/security/jwt.js";
import { isTokenRevoked } from "../../core/security/tokenBlacklist.js";
import { getUserRolesAndPermissions } from "../../core/security/rbac.service.js";

/**
 * Authentication middleware
 * Validates JWT token and injects user data (including roles and permissions)
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  // Check if token is revoked
  const revoked = await isTokenRevoked(token);
  if (revoked) {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const payload = verifyJwt(token);

    // If JWT already has roles and permissions, use them
    if (payload.roles && payload.permissions !== undefined) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
        isAdmin: payload.isAdmin || false,
      };
      return next();
    }

    // Otherwise, resolve from database
    const userWithRBAC = await getUserRolesAndPermissions(payload.sub);

    if (!userWithRBAC) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = {
      id: userWithRBAC.id,
      email: userWithRBAC.email,
      name: userWithRBAC.name,
      roles: userWithRBAC.roles,
      permissions: userWithRBAC.permissions,
      isAdmin: userWithRBAC.isAdmin,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

/**
 * Alias for authMiddleware for consistency
 */
export const authenticateJWT = authMiddleware;
