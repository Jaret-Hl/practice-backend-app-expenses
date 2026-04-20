import { Request, Response } from "express";
import { EnterpriseService } from "./enterprises.service.js";
import { parsePagination, formatPaginatedResponse } from "../../shared/utils/pagination.js";

export const getEnterprises = async (req: Request, res: Response) => {
  const { active_cyh, search, page, limit } = req.query;
  const userId = req.user?.id;
  const pagination = parsePagination(page as string | number, limit as string | number);

  const { data, error, count } = await EnterpriseService.getAll({
    active_cyh: active_cyh as string,
    search: search as string,
    userId: userId,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  const totalCount = count || data?.length || 0;
  const formattedResponse = formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount);

  res.json(formattedResponse);
};

export const getEnterpriseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await EnterpriseService.getById(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "Empresa no encontrado" });

  // Authorization check - user must own the resource
  if (data.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para acceder a este recurso" });
  }

  res.json(data);
};

export const createEnterprise = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = {
    ...req.body,
    created_by_user_id: userId,
  };

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const { data, error } = await EnterpriseService.create(payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.status(201).json(data[0]);
};

export const updateEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if enterprise exists and user owns it
  const { data: existingEnterprise, error: fetchError } = await EnterpriseService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingEnterprise) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  // Authorization check
  if (existingEnterprise.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para modificar este recurso" });
  }

  const payload = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await EnterpriseService.update(id, payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);
};

export const deleteEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if enterprise exists and user owns it
  const { data: existingEnterprise, error: fetchError } = await EnterpriseService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingEnterprise) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  // Authorization check
  if (existingEnterprise.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para eliminar este recurso" });
  }

  const { error } = await EnterpriseService.delete(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json({ message: `Empresa ${id} eliminada` });
};