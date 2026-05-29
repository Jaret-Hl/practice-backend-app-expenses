import { z } from "zod";

// Validación para asignación de rol a usuario
export const AssignRoleSchema = z.object({
  user_id: z.number().positive("ID de usuario inválido"),
  role_id: z.number().positive("ID de rol inválido"),
});

// Validación para asignación de permiso a rol
export const AssignPermissionSchema = z.object({
  role_id: z.number().positive("ID de rol inválido"),
  permission_id: z.number().positive("ID de permiso inválido"),
});

export type AssignRoleDTO = z.infer<typeof AssignRoleSchema>;
export type AssignPermissionDTO = z.infer<typeof AssignPermissionSchema>;