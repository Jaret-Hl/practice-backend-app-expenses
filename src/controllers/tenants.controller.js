// src/controllers/tenants.controller.js
import { supabase } from "../db.js";

export const getTenants = async (req, res) => {
  //1. capturar el parametro de consulta "active"
  const { is_active } = req.query;
  // 2. inicializar la consulta
  let query = supabase.from("tenant").select("*");
  // 3. aplicar filtro condicionalmente
  if (is_active !== undefined) {
    const isActiveBool = is_active === "true";
    query = query.eq("is_active", isActiveBool);
  }
  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getTenantById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "No se encontró el tenant" });

  res.json(data);
};

export const createTenant = async (req, res) => {
  const { name, description, link, is_active, created_by_user_id } = req.body;
  if (!name || !description || !link || is_active === undefined || !created_by_user_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  const { data, error } = await supabase
    .from('tenant')
    .insert([{ name, description, link, is_active, created_by_user_id }])
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo crear el tenant' });
  res.status(201).json(data[0]);
}


export const updateTenant = async (req, res) => {
  const { id } = req.params;
  const updatedTenant = req.body;
  const { data, error } = await supabase
    .from("tenant")
    .update(updatedTenant)
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo actualizar el tenant" });
  res.json(data[0]);
};

export const deleteTenant = async (req, res) => {
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
