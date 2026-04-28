// src/controllers/expenses.controller.js
import { Request, Response } from 'express';
import { supabase } from '../../core/db.js';
import { HttpError } from '../../core/errors/HttpError.js';
import { parsePagination, formatPaginatedResponse } from '../../shared/utils/pagination.js';


export const getExpenses = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  const pagination = parsePagination(page as string | number, limit as string | number);
  
  let query = supabase.from('expense').select('*', { count: 'exact' });
  
  if (userId) {
    query = query.eq('userId', userId);
  }
  
  // Apply pagination
  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) return res.status(500).json({ error: 'Error interno del servidor' });
  
  const totalCount = count || 0;
  const formattedResponse = formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount);
  res.json(formattedResponse);
}

export const getExpenseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  const { data, error } = await supabase
    .from('expense')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return res.status(500).json({ error: 'Error interno del servidor' });
  
  // Check authorization - user must own the expense
  if (data && userId && data.userId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
  }
  
  if (!data) return res.status(404).json({ error: 'Gasto no encontrado' });
  res.json(data);
}

export const createExpense = async (req: Request, res: Response) => {
  const { title, category, amount, date } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!title || !category || !amount || !date) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const { data, error } = await supabase
    .from('expense')
    .insert([{ title, category, amount, date, userId }])
    .select();

  if (error) return res.status(500).json({ error: 'Error interno del servidor' });
  res.status(201).json(data[0]);
}

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updatedData = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  // Check if expense exists and user owns it
  const { data: existingExpense, error: fetchError } = await supabase
    .from('expense')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) return res.status(500).json({ error: 'Error interno del servidor' });

  if (!existingExpense) {
    return res.status(404).json({ error: 'Gasto no encontrado' });
  }

  // Authorization check
  if (existingExpense.userId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso para modificar este recurso' });
  }

  const { data, error } = await supabase
    .from('expense')
    .update(updatedData)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'Error interno del servidor' });
  res.json(data[0]);
}

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  // Check if expense exists and user owns it
  const { data: existingExpense, error: fetchError } = await supabase
    .from('expense')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) return res.status(500).json({ error: 'Error interno del servidor' });

  if (!existingExpense) {
    return res.status(404).json({ error: 'Gasto no encontrado' });
  }

  // Authorization check
  if (existingExpense.userId !== userId) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar este recurso' });
  }

  const { data, error } = await supabase
    .from('expense')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: 'Error interno del servidor' });
  res.json({ message: `Expense with ID: ${id} deleted` });
}