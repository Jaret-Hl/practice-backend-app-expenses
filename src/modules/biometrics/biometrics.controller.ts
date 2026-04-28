// src/controllers/biometrics.controller.js
import { Request, Response } from "express";
import { supabase } from '../../core/db.js';
import { parsePagination, formatPaginatedResponse } from "../../shared/utils/pagination.js";

export const getBiometrics = async (req: Request, res: Response) => {
  const { status, search, page, limit } = req.query;
  const userId = req.user?.id;
  const pagination = parsePagination(page as string | number, limit as string | number);
  
  let query = supabase.from("biometric_device").select("*, tenant:tenant_id(id, name)", { count: "exact" });
  
  // Filter by current user
  if (userId) {
    query = query.eq("created_by_user_id", userId);
  }
  
  // 3. aplicar filtro condicionalmente
  if (status !== undefined) {
    const isActiveBool = status === "true";
    query = query.eq("status", isActiveBool);
  }

  const term = typeof search === "string" ? search.trim() : "";
  if(term.length >= 3) {
    const like = `%${term}%`;
    query = query.or(`model.ilike.${like},serial_number.ilike.${like}`);
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

export const getBiometricById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const idStr = Array.isArray(id) ? id[0] : id;
  
  // Validar que id sea un número
  if (isNaN(Number(idStr)) || !idStr) {
    return res.status(400).json({ error: "El ID debe ser un número válido" });
  }

  const { data, error } = await supabase
    .from("biometric_device")
    .select("*, tenant:tenant_id(id, name)")
    .eq("id", parseInt(idStr))
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "No se encontró el biométrico" });

  // Authorization check - user must own the resource
  if (data.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para acceder a este recurso" });
  }

  res.json(data);
};

export const createBiometric = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { tenant_id, brand, model, serial_number, reception_date, installation_date, warranty_period, status, location_state, branch, hc_count, observations } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  
  if (!tenant_id || !brand || !model || !serial_number) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  
  const { data, error } = await supabase
    .from("biometric_device")
    .insert([{ tenant_id, brand, model, serial_number, reception_date, installation_date, warranty_period, status, location_state, branch, hc_count, observations, created_by_user_id: userId }])
    .select("*, tenant:tenant_id(id, name)");

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });
  res.status(201).json(data[0]);
};

export const updateBiometric = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if biometric device exists and user owns it
  const { data: existingBiometric, error: fetchError } = await supabase
    .from("biometric_device")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingBiometric) {
    return res.status(404).json({ error: "Biométrico no encontrado" });
  }

  // Authorization check
  if (existingBiometric.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para modificar este recurso" });
  }

  const updatedBiometric = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: userId,
  };

  const { data, error } = await supabase
    .from("biometric_device")
    .update(updatedBiometric)
    .eq("id", id)
    .select("*, tenant:tenant_id(id, name)");

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);
};


export const deleteBiometric = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Check if biometric device exists and user owns it
  const { data: existingBiometric, error: fetchError } = await supabase
    .from("biometric_device")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });

  if (!existingBiometric) {
    return res.status(404).json({ error: "Biométrico no encontrado" });
  }

  // Authorization check
  if (existingBiometric.created_by_user_id !== userId) {
    return res.status(403).json({ error: "No tienes permiso para eliminar este recurso" });
  }

  const { data, error } = await supabase
    .from("biometric_device")
    .delete()
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });
  res.json({ message: `Biométrico with ID: ${id} deleted` });
};

export const inactivateBiometric = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("biometric_device")
    .update({ status: false, updated_at: new Date().toISOString() })  // ← Cambiar a "RETIRADO"
    .eq("id", id)
    .select();
  if (error)
    return res.status(500).json({ error: "No se pudo inactivar el biométrico" });

  res.json(data[0]);
};