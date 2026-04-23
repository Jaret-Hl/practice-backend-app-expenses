// src/modules/biometrics/biometrics.schema.ts
import { z } from "zod";

export const BiometricBaseSchema = z.object({
  serial_number: z.string().min(1),
  model: z.string().min(1),
  observations: z.string().optional(),
  status: z.boolean().default(true),
});

export const BiometricCreateSchema = BiometricBaseSchema.extend({
  created_by_user_id: z.number(),
});

export const BiometricUpdateSchema = BiometricBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type BiometricCreateDTO = z.infer<typeof BiometricCreateSchema>;
export type BiometricUpdateDTO = z.infer<typeof BiometricUpdateSchema>;
export type Biometric = z.infer<typeof BiometricBaseSchema> & { id: number };