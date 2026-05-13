/**
 * ADMIN UTILITIES SERVICE
 * Funciones auxiliares para gestionar roles y permisos
 */

import { supabase } from "../../core/db.js";
import {
  getAllRoles,
  getAllPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getRoleWithPermissions,
} from "../../core/security/rbac.service.js";

/**
 * Get complete role hierarchy with all permissions
 */
export const getRoleHierarchy = async () => {
  const roles = await getAllRoles();
  const allPerms = await getAllPermissions();

  const rolePermissions = await Promise.all(
    roles.map(async (role) => getRoleWithPermissions(role.id))
  );

  return rolePermissions.map((rp) => ({
    role: rp?.name,
    description: rp?.description,
    permissionCount: rp?.permissions?.length || 0,
    permissions: rp?.permissions?.map((p) => p.name) || [],
  }));
};

/**
 * Get user complete profile with roles and permissions
 */
export const getUserProfile = async (userId: number) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, created_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return null;
  }

  // Get user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  const roleIds = (userRoles || []).map((ur) => ur.role_id);

  // Get role names
  const { data: roles } = await supabase
    .from("roles")
    .select("name")
    .in("id", roleIds);

  const roleNames = (roles || []).map((r) => r.name);

  return {
    ...user,
    roles: roleNames,
  };
};

/**
 * List all users with their roles
 */
export const listUsersWithRoles = async (limit = 100, offset = 0) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, created_at")
    .range(offset, offset + limit - 1);

  if (error) {
    return [];
  }

  const usersWithRoles = await Promise.all(
    (users || []).map(async (user) => {
      const profile = await getUserProfile(user.id);
      return profile;
    })
  );

  return usersWithRoles.filter(Boolean);
};

/**
 * Assign multiple roles to user
 */
export const assignMultipleRolesToUser = async (
  userId: number,
  roleNames: string[]
) => {
  try {
    // Get role IDs
    const { data: roles } = await supabase
      .from("roles")
      .select("id")
      .in("name", roleNames);

    if (!roles || roles.length === 0) {
      throw new Error("Roles no encontrados");
    }

    // Remove all existing roles
    await supabase.from("user_roles").delete().eq("user_id", userId);

    // Assign new roles
    const roleIds = roles.map((r) => r.id);
    const { error } = await supabase
      .from("user_roles")
      .insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })));

    if (error) {
      throw error;
    }

    return { success: true, message: `${roleNames.length} roles asignados` };
  } catch (error) {
    console.error("Error assigning roles:", error);
    throw error;
  }
};

/**
 * Revoke all roles from user
 */
export const revokeAllRolesFromUser = async (userId: number) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { success: true, message: "Todos los roles fueron revocados" };
  } catch (error) {
    console.error("Error revoking roles:", error);
    throw error;
  }
};

/**
 * Create new role with permissions
 */
export const createRoleWithPermissions = async (
  name: string,
  description: string,
  permissionNames: string[]
) => {
  try {
    // Create role
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .insert([{ name, description }])
      .select()
      .single();

    if (roleError || !role) {
      throw roleError || new Error("Error creating role");
    }

    // Get permission IDs
    const { data: perms } = await supabase
      .from("permissions")
      .select("id")
      .in("name", permissionNames);

    if (perms && perms.length > 0) {
      const permIds = perms.map((p) => p.id);
      await supabase
        .from("role_permissions")
        .insert(permIds.map((permId) => ({ role_id: role.id, permission_id: permId })));
    }

    return {
      success: true,
      role: {
        id: role.id,
        name: role.name,
        permissionCount: perms?.length || 0,
      },
    };
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

/**
 * Get audit log of user activity
 */
export const getUserActivityLog = async (userId: number, limit = 50) => {
  const { data, error } = await supabase
    .from("audit_logs") // Asume que tienes tabla audit_logs
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching audit log:", error);
    return [];
  }

  return data || [];
};

/**
 * Get permission usage statistics
 */
export const getPermissionStats = async () => {
  const { data: permissions } = await supabase
    .from("permissions")
    .select("id, name");

  const stats = await Promise.all(
    (permissions || []).map(async (perm) => {
      const { count } = await supabase
        .from("role_permissions")
        .select("*", { count: "exact", head: true })
        .eq("permission_id", perm.id);

      return {
        permission: perm.name,
        usedInRoles: count || 0,
      };
    })
  );

  return stats;
};
