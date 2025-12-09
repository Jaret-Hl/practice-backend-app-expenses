// src/modules/tenants/tenants.schema.ts
import { z } from "zod";

export const TenantBaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url(),
  is_active: z.boolean().default(true),
});

export const TenantCreateSchema = TenantBaseSchema.extend({
  created_by_user_id: z.number(),
});

export const TenantUpdateSchema = TenantBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type TenantCreateDTO = z.infer<typeof TenantCreateSchema>;
export type TenantUpdateDTO = z.infer<typeof TenantUpdateSchema>;
export type Tenant = z.infer<typeof TenantBaseSchema> & { id: number };