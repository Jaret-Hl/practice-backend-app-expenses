import jwt, { type SignOptions, type JwtPayload as JwtPayloadDefault } from "jsonwebtoken";
import { ENV } from "../env.js";

export type JwtPayload = Omit<JwtPayloadDefault, "sub"> & {
  sub: number;
  email: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
};

export type RefreshJwtPayload = Omit<JwtPayloadDefault, "sub"> & {
  sub: number;
  type: "refresh";
};

/**
 * Sign a short-lived access token (default 15 minutes)
 */
export const signJwt = (payload: JwtPayload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "15m", // Short-lived access token
  });
};

/**
 * Sign a long-lived refresh token (default 7 days)
 */
export const signRefreshJwt = (userId: number) => {
  const payload: RefreshJwtPayload = {
    sub: userId,
    type: "refresh",
  };

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "7d", // Long-lived refresh token
  });
};

/**
 * Verify access token
 */
export const verifyJwt = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ENV.JWT_SECRET) as unknown;

  if (typeof decoded === "string" || decoded === null || typeof decoded !== "object") {
    throw new Error("Token inválido");
  }

  if (typeof (decoded as { sub?: unknown }).sub !== "number" || typeof (decoded as { email?: unknown }).email !== "string") {
    throw new Error("Token inválido");
  }

  return decoded as JwtPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshJwt = (token: string): RefreshJwtPayload => {
  const decoded = jwt.verify(token, ENV.JWT_SECRET) as unknown;

  if (typeof decoded === "string" || decoded === null || typeof decoded !== "object") {
    throw new Error("Token inválido");
  }

  const decodedObj = decoded as Record<string, unknown>;
  if (typeof decodedObj.sub !== "number" || decodedObj.type !== "refresh") {
    throw new Error("Refresh token inválido");
  }

  return decoded as RefreshJwtPayload;
};
