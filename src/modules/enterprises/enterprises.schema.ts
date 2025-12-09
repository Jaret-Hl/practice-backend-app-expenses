import { z } from "zod";

export const EnterpriseBaseSchema = z.object({
  name: z.string().min(1),
  code_enterprise: z.string().min(1),
  active_cyh: z.enum(["SI", "NO"]).default("SI"),
});

export const EnterpriseCreateSchema = EnterpriseBaseSchema.extend({
  created_by_user_id: z.number(),
});

export const EnterpriseUpdateSchema = EnterpriseBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type EnterpriseCreateDTO = z.infer<typeof EnterpriseCreateSchema>;
export type EnterpriseUpdateDTO = z.infer<typeof EnterpriseUpdateSchema>;
export type Enterprise = z.infer<typeof EnterpriseBaseSchema> & { id: number };