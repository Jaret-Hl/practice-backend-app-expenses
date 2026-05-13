import { NextFunction, Request, Response } from "express";
import { supabase } from "../../core/db.js";

/**
 * Tipos de permisos disponibles
 */
export type PermissionAction = "create" | "read" | "update" | "delete";

/**
 * Interfaz para un permiso individual
 */
export interface Permission {
  id: any;
  name: any;
  resource?: any;
  action?: any;
}

/**
 * Interfaz para el rol con sus permisos
 */
export interface RoleWithPermissions {
  id: any;
  name: any;
  permissions: Array<{
    permission: Permission;
  }>;
}

/**
 * Interfaz para la respuesta de Supabase con el rol del usuario
 */
export interface UserRoleResponse {
  role: RoleWithPermissions;
}

/**
 * Interfaz para el usuario autenticado en la request
 * Nota: La declaración global Express.Request está en types/express.d.ts
 */
export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
}

/**
 * Middleware para verificar permisos del usuario
 * @param resource - Recurso (ej: 'enterprises', 'quotes', etc.)
 * @param action - Acción requerida (create, read, update, delete)
 */
export const checkPermission = (resource: string, action: PermissionAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // Obtener el rol del usuario desde la tabla user_roles
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select(`
          role:roles!inner(
            id,
            name,
            permissions:role_permissions(
              permission:permissions!inner(
                id,
                name,
                resource,
                action
              )
            )
          )
        `)
        .eq("user_id", userId)
        .single() as { data: UserRoleResponse | null; error: any };

      if (roleError || !userRole?.role) {
        // Si no tiene rol asignado, denegar acceso
        return res.status(403).json({ error: "No tienes permisos para esta acción" });
      }

      const role = userRole.role;
      
      // Verificar si el rol tiene el permiso requerido
      const hasPermission = role.permissions?.some(
        (p) => p.permission?.resource === resource && p.permission?.action === action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: "No tienes permisos para realizar esta acción",
          required: `${resource}:${action}`,
        });
      }

      // Adjuntar información del rol a la request para uso posterior
      if (!req.user!.roles) {
        req.user!.roles = [];
      }
      if (role.name && !req.user!.roles.includes(role.name)) {
        req.user!.roles.push(role.name);
      }
      req.user!.permissions = role.permissions?.map((p: any) => p.permission?.name) || [];

      next();
    } catch (error) {
      console.error("Error en checkPermission:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
};

/**
 * Helper para obtener los permisos del usuario actual
 */
export const getUserPermissions = async (userId: number): Promise<string[]> => {
  const { data: userRole, error } = await supabase
    .from("user_roles")
    .select(`
      role:roles!inner(
        permissions:role_permissions(
          permission:permissions!inner(name)
        )
      )
    `)
    .eq("user_id", userId)
    .single() as { data: UserRoleResponse | null; error: any };

  if (error || !userRole?.role) {
    return [];
  }

  return userRole.role.permissions?.map((p) => p.permission?.name) || [];
};

/**
 * Helper para verificar si el usuario es admin
 */
export const isAdmin = async (userId: number): Promise<boolean> => {
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role:roles!inner(name)")
    .eq("user_id", userId)
    .single() as { data: { role: { name: any } } | null; error: any };

  return userRole?.role?.name === "admin";
};