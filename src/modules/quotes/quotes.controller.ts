// src/controllers/Quotess.controller.js
import { Request, Response } from "express";
import { supabase } from '../../core/db.js';

export const getQuotes = async (req: Request, res: Response) => {
  //1. capturar el parametro de consulta "active" y "search"
  const { is_active, search } = req.query;
  // considerar paginación en el futuro
  // const limit = parseInt(req.query.limit, 10) || 20;
  // const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  // const from = (page - 1) * limit;
  // const to = from + limit - 1;
  
  // 2. inicializar la consulta
  let query = supabase.from("quotes").select("*");
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

export const getQuotesById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validar que id sea un número
  if (isNaN(Number(id)) || !id) {
    return res.status(400).json({ error: "El ID debe ser un número válido" });
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "No se encontró el Quotes" });

  res.json(data);
};

export const createQuotes = async (req: Request, res: Response) => {
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
    .from("quotes")
    .insert([{ name, description, link, is_active, created_by_user_id }])
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo crear el Quotes" });
  res.status(201).json(data[0]);
};

export const updateQuotes = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedQuotes = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: req.body.updated_by_user_id || null,
  };

  const { data, error } = await supabase
    .from("quotes")
    .update(updatedQuotes)
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo actualizar el Quotes" });

  res.json(data[0]);
};


export const deleteQuotes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo eliminar el Quotes" });
  res.json({ message: `Quotes with ID: ${id} deleted` });
};

export const inactivateQuotes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("quotes")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();
  if (error)
    return res.status(500).json({ error: "No se pudo inactivar el Quotes" });

  res.json(data[0]);
};