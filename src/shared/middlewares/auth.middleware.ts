import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../../core/security/jwt.js";
import { isTokenRevoked } from "../../core/security/tokenBlacklist.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  // Check if token is revoked (now async)
  const revoked = await isTokenRevoked(token);
  if (revoked) {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
