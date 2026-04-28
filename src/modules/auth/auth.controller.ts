import { Request, Response } from "express";
import { supabase } from "../../core/db.js";
import { hashPassword, comparePasswords } from "../../core/security/bcrypt.js";
import { revokeToken } from "../../core/security/tokenBlacklist.js";
import { signJwt, signRefreshJwt, verifyRefreshJwt } from "../../core/security/jwt.js";
import { validatePasswordStrength } from "../../core/security/passwordValidator.js";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: "Contraseña insegura",
      details: passwordValidation.errors,
    });
  }

  const { data: existingUser, error: existenceError } = await supabase
    .from("user")
    .select("id")
    .eq("email", email)
    .limit(1)
    .single();

  if (existenceError && existenceError.code !== "PGRST116") {
    return res.status(500).json({ error: "Error interno del servidor" });
  }

  if (existingUser) {
    return res.status(409).json({ error: "El usuario ya existe" });
  }

  const password_hash = await hashPassword(password);
  const newUser: Record<string, unknown> = {
    email,
    password_hash,
  };

  if (name) {
    newUser.name = name;
  }

  const { data, error } = await supabase
    .from("user")
    .insert([newUser])
    .select("id, email, name")
    .single();

  if (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }

  const token = signJwt({ sub: data.id, email: data.email });
  const refreshToken = signRefreshJwt(data.id);

  return res.status(201).json({ 
    user: data, 
    token,
    refreshToken,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  const { data, error } = await supabase
    .from("user")
    .select("id, email, name, password_hash")
    .eq("email", email)
    .limit(1)
    .single();

  if (error) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const isValid = await comparePasswords(password, data.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = signJwt({ sub: data.id, email: data.email });
  const refreshToken = signRefreshJwt(data.id);

  return res.json({ 
    user: { id: data.id, email: data.email, name: data.name }, 
    token,
    refreshToken,
  });
};

export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  return res.json({ user: req.user });
};

export const logoutUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "Token no proporcionado" });
  }

  await revokeToken(token);
  return res.json({ message: "Sesión cerrada correctamente. Elimina el token en el cliente." });
};

/**
 * Refresh access token using refresh token
 * Client sends refresh token in body: { refreshToken: "..." }
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: refreshTokenString } = req.body;

  if (!refreshTokenString) {
    return res.status(400).json({ error: "Refresh token requerido" });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshJwt(refreshTokenString);

    // Get user data to include in new access token
    const { data: user, error } = await supabase
      .from("user")
      .select("id, email")
      .eq("id", decoded.sub)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Generate new access token
    const newAccessToken = signJwt({ sub: user.id, email: user.email });

    // Optionally generate new refresh token (token rotation)
    const newRefreshToken = signRefreshJwt(user.id);

    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ error: "Refresh token inválido o expirado" });
  }
};
