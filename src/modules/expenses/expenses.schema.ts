import { z } from "zod";

export const ExpenseBaseSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  category: z.string().min(1, "Categoría requerida"),
  amount: z.number().positive("La cantidad debe ser positiva"),
  date: z.string().datetime(),
});

export const ExpenseCreateSchema = ExpenseBaseSchema.extend({
  userId: z.number().positive("ID de usuario inválido"),
});

export const ExpenseUpdateSchema = ExpenseBaseSchema.partial();

export type ExpenseCreateDTO = z.infer<typeof ExpenseCreateSchema>;
export type ExpenseUpdateDTO = z.infer<typeof ExpenseUpdateSchema>;
export type Expense = z.infer<typeof ExpenseBaseSchema> & { id: number };
