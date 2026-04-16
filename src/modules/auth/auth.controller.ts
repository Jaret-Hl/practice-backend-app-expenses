import { Request, Response } from "express";
import { supabase } from "../../core/db.js";
import { hashPassword, comparePasswords } from "../../core/security/bcrypt.js";
import { revokeToken } from "../../core/security/tokenBlacklist.js";
import { signJwt } from "../../core/security/jwt.js";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  const { data: existingUser, error: existenceError } = await supabase
    .from("user")
    .select("id")
    .eq("email", email)
    .limit(1)
    .single();

  if (existenceError && existenceError.code !== "PGRST116") {
    return res.status(500).json({ error: existenceError.message });
  }

  if (existingUser) {
    return res.status(409).json({ error: "El usuario ya existe" });
  }

  const password_hash = await hashPassword(password);
  const newUser: Record<string, unknown> = {
    email,
    password: password_hash,
  };

  if (name) {
    newUser.name = name;
  }

  const { data, error } = await supabase
    .from("user")
    .insert([newUser])
    .select("id, email, name, password_hash")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const token = signJwt({ sub: data.id, email: data.email });
  return res.status(201).json({ user: data, token });
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
  return res.json({ user: { id: data.id, email: data.email, name: data.name }, token });
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

  revokeToken(token);
  return res.json({ message: "Sesión cerrada correctamente. Elimina el token en el cliente." });
};
