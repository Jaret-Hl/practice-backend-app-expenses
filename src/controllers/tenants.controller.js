// src/controllers/tenants.controller.js
import { supabase } from '../db.js'

export const getTenants = async (req, res) => {
  const { data, error } = await supabase.from('tenant').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export const getTenantById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('tenant').select('*').eq('id', id).single()

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'No se encontró el tenant' })

  res.json(data)
}

/* export const createTenant = async (req, res) => {
  const { title, category, amount, date, userId } = req.body;
  if (!title || !category || !amount || !date || !userId) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  const { data, error } = await supabase
    .from('expense')
    .insert([{ title, category, amount, date, userId }])
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo crear el gasto' });
  res.status(201).json(data[0]);
}
*/

export const updateTenant = async (req, res) => {
  const { id } = req.params;
  const updatedTenant = req.body;
  const { data, error } = await supabase
    .from('tenant')
    .update(updatedTenant)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo actualizar el tenant' });
  res.json(data[0]);
}

export const deleteTenant = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('tenant')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo eliminar el tenant' });
  res.json({ message: `Tenant with ID: ${id} deleted` });
}
