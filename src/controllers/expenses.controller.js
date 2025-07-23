// src/controllers/expenses.controller.js
import { supabase } from '../db.js'

export const getExpenses = async (req, res) => {
  const { data, error } = await supabase.from('Expense').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export const getExpenseById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('Expense').select('*').eq('id', id).single()
  if (error) return res.status(500).json({ error: 'No se encontró el gasto' })
  res.json(data)
}

export const createExpense = async (req, res) => {
  const { title, category, amount, date, userId } = req.body;
  if (!title || !category || !amount || !date || !userId) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  const { data, error } = await supabase
    .from('Expense')
    .insert([{ title, category, amount, date, userId }])
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo crear el gasto' });
  res.status(201).json(data[0]);
}

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const updatedExpense = req.body;
  const { data, error } = await supabase
    .from('Expense')
    .update(updatedExpense)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo actualizar el gasto' });
  res.json(data[0]);
}

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Expense')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo eliminar el gasto' });
  res.json({ message: `Expense with ID: ${id} deleted` });
}