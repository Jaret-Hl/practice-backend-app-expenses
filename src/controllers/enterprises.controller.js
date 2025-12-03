import { supabase } from '../db.js'

export const getEnterprise = async (req, res) => {
  const { data, error } = await supabase.from('enterprise').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export const getEnterpriseById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('enterprise').select('*').eq('id', id).single()
  if (error) return res.status(500).json({ error: 'No se encontró la empresa' })
  res.json(data)
}

export const createEnterprise = async (req, res) => {
  const { code_enterprise, name, plaza, active_cyh, created_by_user_id } = req.body;
  if (!code_enterprise || !name || !plaza || !active_cyh || !created_by_user_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  const { data, error } = await supabase
    .from('enterprise')
    .insert([{ code_enterprise, name, plaza, active_cyh, created_by_user_id }])
    .select();
  if (error) return res.status(500).json({ error: 'No se pudo crear la empresa' });
  res.status(201).json(data[0]);
}

export const updateEnterprise = async (req, res) => {
  const { id } = req.params;

  const updatedEnterprise = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: req.user?.id || req.body.updated_by_user_id || null
  };

  const { data, error } = await supabase
    .from('enterprise')
    .update(updatedEnterprise)
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: 'No se pudo actualizar la empresa' });
  res.json(data[0]);
}

export const deleteEnterprise = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("enterprise")
    .delete()
    .eq("id", id)
    .select();

  if (error)
    return res.status(500).json({ error: "No se pudo eliminar la empresa" });
  res.json({ message: `Empresa with ID: ${id} deleted` });
};

export const inactivateEnterprise = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("enterprise")
    .update({ active_cyh: "NO", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();
  if (error)
    return res.status(500).json({ error: "No se pudo inactivar la empresa" });
  res.json(data[0]);
}