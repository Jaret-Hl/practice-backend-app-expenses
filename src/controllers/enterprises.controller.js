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

