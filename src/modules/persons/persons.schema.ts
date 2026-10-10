import { z } from "zod";

export const PersonBaseSchema = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  second_last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  curp: z.string().optional(),
  rfc: z.string().optional(),
  birth_date: z.string().optional(), // ISO date (YYYY-MM-DD)
  status: z.boolean().default(true),
});

export const PersonCreateSchema = PersonBaseSchema.extend({
  created_by_user_id: z.number().optional(),
});

export const PersonUpdateSchema = PersonBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type PersonCreateDTO = z.infer<typeof PersonCreateSchema>;
export type PersonUpdateDTO = z.infer<typeof PersonUpdateSchema>;
export type Person = z.infer<typeof PersonBaseSchema> & { id: number };
