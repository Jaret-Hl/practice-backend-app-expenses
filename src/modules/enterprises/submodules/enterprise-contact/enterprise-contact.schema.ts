import { z } from "zod";

// Crea un contacto para una empresa. Si se envía person_id, se vincula una
// persona ya existente (evita duplicar); si no, se crean los datos mínimos
// de una persona nueva.
export const EnterpriseContactCreateSchema = z
  .object({
    person_id: z.number().optional(),
    first_name: z.string().min(1).optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role_description: z.string().optional(),
  })
  .refine((data) => data.person_id || data.first_name, {
    message: "Debes enviar person_id o los datos de una persona nueva (first_name requerido)",
  });

export type EnterpriseContactCreateDTO = z.infer<typeof EnterpriseContactCreateSchema>;
