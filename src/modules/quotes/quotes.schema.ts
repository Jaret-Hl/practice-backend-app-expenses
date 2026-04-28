import { z } from "zod";

export const QuoteBaseSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().min(1, "Descripción requerida"),
  link: z.string().url("Link debe ser una URL válida"),
  is_active: z.boolean().default(true),
});

export const QuoteCreateSchema = QuoteBaseSchema.extend({
  created_by_user_id: z.number().positive("ID de usuario inválido"),
});

export const QuoteUpdateSchema = QuoteBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type QuoteCreateDTO = z.infer<typeof QuoteCreateSchema>;
export type QuoteUpdateDTO = z.infer<typeof QuoteUpdateSchema>;
export type Quote = z.infer<typeof QuoteBaseSchema> & { id: number };
