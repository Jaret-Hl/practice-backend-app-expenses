import { z } from "zod";

export const EnterpriseRiskRateBaseSchema = z.object({
  enterprise_id: z.number(),
  registration_number: z.string().min(1),
  presentation_folio: z.string().min(1),
  risk_rate: z.string().min(1),
  fiscal_year: z.string().min(1),
});

export const EnterpriseCreateSchema = EnterpriseRiskRateBaseSchema.extend({
  created_by_user_id: z.number(),
});

export const EnterpriseUpdateSchema = EnterpriseRiskRateBaseSchema.partial().extend({
  updated_by_user_id: z.number().optional(),
});

export type EnterpriseCreateDTO = z.infer<typeof EnterpriseCreateSchema>;
export type EnterpriseUpdateDTO = z.infer<typeof EnterpriseUpdateSchema>;
export type Enterprise = z.infer<typeof EnterpriseRiskRateBaseSchema> & { id: number };