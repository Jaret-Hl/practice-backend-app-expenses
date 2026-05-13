// src/controllers/tenants.controller.js
import { Request, Response } from "express";
import { supabase } from '../../core/db.js';
import { parsePagination, formatPaginatedResponse } from "../../shared/utils/pagination.js";

export const getTenants = async (req: Request, res: Response) => {
  const { is_active, search, page, limit } = req.query;
  const userId = req.user?.id;
  const pagination = parsePagination(page as string | number, limit as string | number);
  
  let query = supabase.from("tenant").select("*", { count: "exact" });
  
  if (is_active !== undefined) {
    const isActiveBool = is_active === "true";
    query = query.eq("is_active", isActiveBool);
  }

  const term = typeof search === "string" ? search.trim() : "";
  if(term.length >= 3) {
    const like = `%${term}%`;
    query = query.or(`name.ilike.${like},description.ilike.${like}`);
  } else if (term.length > 0) {
    return res.status(400).json({ warning: "El término de búsqueda debe tener al menos 3 caracteres" });
  }

  // Apply pagination
  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  
  const totalCount = count || 0;
  const formattedResponse = formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount);
  res.json(formattedResponse);
};

export const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const idStr = Array.isArray(id) ? id[0] : id;
  
  // Validar que id sea un número
  if (isNaN(Number(idStr)) || !idStr) {
    return res.status(400).json({ error: "El ID debe ser un número válido" });
  }

  const { data, error } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", parseInt(idStr))
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "No se encontró el tenant" });

  // Authorization check - user must own the resource
  if (data.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para acceder a este recurso" });
  }

  res.json(data);
};

export const createTenant = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, description, link, is_active } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  
  if (!name || !description || !link || is_active === undefined) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  
  const { data, error } = await supabase
    .from("tenant")
    .insert([{ name, description, link, is_active, created_by_user_id: userId }])
    .select();

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });
  res.status(201).json(data[0]);
};

export const updateTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if tenant exists and user owns it
  const { data: existingTenant, error: fetchError } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingTenant) {
    return res.status(404).json({ error: "Tenant no encontrado" });
  }

  // Authorization check
  if (existingTenant.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para modificar este recurso" });
  }

  const updatedTenant = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: userId,
  };

  const { data, error } = await supabase
    .from("tenant")
    .update(updatedTenant)
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);
};


export const deleteTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if tenant exists and user owns it
  const { data: existingTenant, error: fetchError } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingTenant) {
    return res.status(404).json({ error: "Tenant no encontrado" });
  }

  // Authorization check
  if (existingTenant.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para eliminar este recurso" });
  }

  const { data, error } = await supabase
    .from("tenant")
    .delete()
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });
  res.json({ message: `Tenant with ID: ${id} deleted` });
};

export const inactivateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("tenant")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();
  if (error)
    return res.status(500).json({ error: "No se pudo inactivar el tenant" });

  res.json(data[0]);
};