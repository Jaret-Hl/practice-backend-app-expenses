// src/modules/biometrics/biometrics.schema.ts
import { z } from "zod";

export const BiometricBaseSchema = z.object({
  tenant_id: z.number().positive("ID de tenant inválido"),
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  serial_number: z.string().min(1, "Número de serie requerido"),
  reception_date: z.string().optional(),
  installation_date: z.string().optional(),
  warranty_period: z.string().optional(),
  status: z.boolean().default(true),
  location_state: z.string().optional(),
  branch: z.string().optional(),
  hc_count: z.number().optional(),
  observations: z.string().optional(),
});

export const BiometricCreateSchema = BiometricBaseSchema;
export const BiometricUpdateSchema = BiometricBaseSchema.partial();

export type BiometricCreateDTO = z.infer<typeof BiometricCreateSchema>;
export type BiometricUpdateDTO = z.infer<typeof BiometricUpdateSchema>;
export type Biometric = z.infer<typeof BiometricBaseSchema> & { id: number };