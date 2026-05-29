import { supabase } from "../../core/db.js";

export class RBACService {
  // Asignar rol a usuario
  static async assignRoleToUser(userId: number, roleId: number) {
    // Validar que usuario y rol existan
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!user) {
      return { error: "Usuario no encontrado", data: null };
    }

    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("id", roleId)
      .single();

    if (!role) {
      return { error: "Rol no encontrado", data: null };
    }

    // Verificar si ya existe la asignación
    const { data: existing } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .single();

    if (existing) {
      return { error: "El usuario ya tiene este rol asignado", data: null };
    }

    // Insertar asignación
    return await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role_id: roleId }])
      .select();
  }

  // Remover rol de usuario
  static async removeRoleFromUser(userId: number, roleId: number) {
    return await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .select();
  }

  // Asignar permiso a rol
  static async assignPermissionToRole(roleId: number, permissionId: number) {
    // Validar rol
    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("id", roleId)
      .single();

    if (!role) {
      return { error: "Rol no encontrado", data: null };
    }

    // Validar permiso
    const { data: permission } = await supabase
      .from("permissions")
      .select("id")
      .eq("id", permissionId)
      .single();

    if (!permission) {
      return { error: "Permiso no encontrado", data: null };
    }

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", roleId)
      .eq("permission_id", permissionId)
      .single();

    if (existing) {
      return { error: "El rol ya tiene este permiso asignado", data: null };
    }

    return await supabase
      .from("role_permissions")
      .insert([{ role_id: roleId, permission_id: permissionId }])
      .select();
  }

  // Remover permiso de rol
  static async removePermissionFromRole(roleId: number, permissionId: number) {
    return await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId)
      .select();
  }
}
