import jwt, { type SignOptions, type JwtPayload as JwtPayloadDefault } from "jsonwebtoken";
import { ENV } from "../env.js";

export type JwtPayload = Omit<JwtPayloadDefault, "sub"> & {
  sub: number;
  email: string;
};

export const signJwt = (payload: JwtPayload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

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
