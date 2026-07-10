import { Request, Response } from "express";
import { UserService } from "./users.service.js";
import { UserUpdateSchema } from "./users.schema.js";
import { parsePagination, formatPaginatedResponse } from "../../shared/utils/pagination.js";
import { supabase } from '../../core/db.js';

export const getUsers = async (req: Request, res: Response) => {
  const { is_active, search, page, limit } = req.query;
  const userId = req.user?.id;
  const pagination = parsePagination(page as string | number, limit as string | number);

  const { data, error, count } = await UserService.getAll({
    is_active: is_active === "true" ? true : is_active === "false" ? false : undefined,
    search: search as string,
    userId,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  
  const totalCount = count || 0;
  const formattedResponse = formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount);
  res.json(formattedResponse);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await UserService.getById(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "Empresa no encontrada" });

  res.json(data);
};

export const createUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = {
    ...req.body,
    created_by_user_id: userId,
  };

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const { data, error } = await UserService.create(payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.status(201).json(data[0]);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Verificar que la empresa existe
  const { data: existingUser, error: fetchError } = await UserService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existingUser) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  const updatedUser = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: userId,
  };

  const { data, error} = await supabase
    .from("enterprise")
    .update(updatedUser)
    .eq("id", id)
    .select()

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);

};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Verificar que la empresa existe
  const { data: existingUser, error: fetchError } = await UserService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existingUser) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  const { error } = await UserService.delete(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json({ message: `Empresa ${id} eliminada` });
};