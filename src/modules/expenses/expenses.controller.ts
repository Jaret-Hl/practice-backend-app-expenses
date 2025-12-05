// src/controllers/expenses.controller.js
import { Request, Response } from 'express';
import { supabase } from '../../core/db.js';


export const getExpenses = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('expense').select('*')
  if (error) return res.status(500).json({ error: 'No se pudieron obtener los gastos' })
  res.json(data)
}

export const getExpenseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('expense').select('*').eq('id', id).single()
  if (error) return res.status(500).json({ error: 'No se encontró el gasto' })
  res.json(data)
}

export const createExpense = async (req: Request, res: Response) => {
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

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedExpense = req.body;
  const { data, error } = await supabase
    .from('expense')
    .update(updatedExpense)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo actualizar el gasto' });
  res.json(data[0]);
}

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('expense')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'No se pudo eliminar el gasto' });
  res.json({ message: `Expense with ID: ${id} deleted` });
}