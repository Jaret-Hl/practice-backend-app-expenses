// src/controllers/tenants.controller.js
import { Request, Response } from "express";
import { supabase } from '../../core/db.js';

export const getTenants = async (req: Request, res: Response) => {
  //1. capturar el parametro de consulta "active" y "search"
  const { is_active, search } = req.query;
  // considerar paginación en el futuro
  // const limit = parseInt(req.query.limit, 10) || 20;
  // const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  // const from = (page - 1) * limit;
  // const to = from + limit - 1;
  
  // 2. inicializar la consulta
  let query = supabase.from("tenant").select("*");
  // 3. aplicar filtro condicionalmente
  if (is_active !== undefined) {
    const isActiveBool = is_active === "true";
    query = query.eq("is_active", isActiveBool);
  }

  // const term = (search || "").trim(); quitar esta línea
  const term = typeof search === "string" ? search.trim() : "";
  if(term.length >= 3) {
    const like = `%${term}%`;
    query = query.or(`name.ilike.${like},description.ilike.${like}`);
  } else if (term.length > 0) {
    return res.status(400).json({ warning: "El término de búsqueda debe tener al menos 3 caracteres" });
  }
  const { data, error } = await query;
  // const { data, error } = await query.range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validar que id sea un número
  if (isNaN(Number(id)) || !id) {
    return res.status(400).json({ error: "El ID debe ser un número válido" });
  }

  const { data, error } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "No se encontró el tenant" });

  res.json(data);
};

export const createTenant = async (req: Request, res: Response) => {
  const { name, description, link, is_active, created_by_user_id } = req.body;
  if (
    !name ||
    !description ||
    !link ||
    is_active === undefined ||
    !created_by_user_id
  ) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  const { data, error } = await supabase
    .from("tenant")
    .insert([{ name, description, link, is_active, created_by_user_id }])
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo crear el tenant" });
  res.status(201).json(data[0]);
};

export const updateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedTenant = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: req.body.updated_by_user_id || null,
  };

  const { data, error } = await supabase
    .from("tenant")
    .update(updatedTenant)
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo actualizar el tenant" });

  res.json(data[0]);
};


export const deleteTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("tenant")
    .delete()
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo eliminar el tenant" });
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