/**
 * RBAC Service
 * Handles role and permission resolution
 */

import { supabase } from "../../core/db.js";
import { UserWithRolesAndPermissions, RBACResult } from "../../types/rbac.js";

const ADMIN_ROLE_NAME = "admin";

/**
 * Get user roles and permissions from database
 * Resolves all permissions assigned to user's roles
 */
export const getUserRolesAndPermissions = async (
  userId: number
): Promise<UserWithRolesAndPermissions | null> => {
  try {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return null;
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return null;
    }

    if (!userRoles || userRoles.length === 0) {
      console.log(`User ${userId} has no roles assigned`);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [],
        permissions: [],
        isAdmin: false,
      };
    }

    const roleIds = userRoles.map((ur) => ur.role_id);

    // Get role names
    const { data: roles, error: roleNamesError } = await supabase
      .from("roles")
      .select("id, name")
      .in("id", roleIds);

    if (roleNamesError) {
      console.error("Error fetching role names:", roleNamesError);
      return null;
    }

    const roleNames = (roles || []).map((r) => r.name);
    const isAdmin = roleNames.includes(ADMIN_ROLE_NAME);
    
    console.log(`User ${userId} roles:`, roleNames);

    // Get all permissions for these roles
    const { data: rolePermissions, error: permError } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .in("role_id", roleIds);

    if (permError) {
      console.error("Error fetching role permissions:", permError);
      return null;
    }

    if (!rolePermissions || rolePermissions.length === 0) {
      console.log(`User ${userId} roles have no permissions assigned`);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: roleNames,
        permissions: [],
        isAdmin,
      };
    }

    const permissionIds = rolePermissions.map((rp) => rp.permission_id);

    // Get permission names
    const { data: permissions, error: permNamesError } = await supabase
      .from("permissions")
      .select("id, name")
      .in("id", permissionIds);

    if (permNamesError) {
      console.error("Error fetching permission names:", permNamesError);
      return null;
    }

    const permissionNames = (permissions || []).map((p) => p.name);
    console.log(`User ${userId} permissions:`, permissionNames);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleNames,
      permissions: permissionNames,
      isAdmin,
    };
  } catch (error) {
    console.error("Error in getUserRolesAndPermissions:", error);
    return null;
  }
};

/**
 * Check if user has required permissions
 */
export const checkPermissions = (
  userPermissions: string[],
  requiredPermissions: string[],
  isAdmin: boolean
): RBACResult => {
  // Admin bypass
  if (isAdmin) {
    return {
      success: true,
      hasPermission: true,
      isAdmin: true,
    };
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  return {
    success: true,
    hasPermission: hasAllPermissions,
    isAdmin: false,
    reason: hasAllPermissions
      ? "Permission granted"
      : `Missing permissions: ${requiredPermissions
          .filter((p) => !userPermissions.includes(p))
          .join(", ")}`,
  };
};

/**
 * Check if user has at least one of the required permissions
 */
export const checkAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[],
  isAdmin: boolean
): RBACResult => {
  // Admin bypass
  if (isAdmin) {
    return {
      success: true,
      hasPermission: true,
      isAdmin: true,
    };
  }

  // Check if user has at least one required permission
  const hasAnyPermission = requiredPermissions.some((perm) =>
    userPermissions.includes(perm)
  );

  return {
    success: true,
    hasPermission: hasAnyPermission,
    isAdmin: false,
    reason: hasAnyPermission
      ? "Permission granted"
      : `Missing at least one of: ${requiredPermissions.join(", ")}`,
  };
};

/**
 * Get all roles from database
 */
export const getAllRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return data || [];
};

/**
 * Get all permissions from database
 */
export const getAllPermissions = async () => {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }

  return data || [];
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId: number, roleId: number) => {
  const { data, error } = await supabase
    .from("user_roles")
    .insert([{ user_id: userId, role_id: roleId }])
    .select();

  return { data, error };
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId: number, roleId: number) => {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId);

  return { error };
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (
  roleId: number,
  permissionId: number
) => {
  const { data, error } = await supabase
    .from("role_permissions")
    .insert([{ role_id: roleId, permission_id: permissionId }])
    .select();

  return { data, error };
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (
  roleId: number,
  permissionId: number
) => {
  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);

  return { error };
};

/**
 * Get role with its permissions
 */
export const getRoleWithPermissions = async (roleId: number) => {
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("id", roleId)
    .single();

  if (roleError || !role) {
    return null;
  }

  const { data: permissions, error: permError } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (permError) {
    return null;
  }

  const permIds = (permissions || []).map((p) => p.permission_id);

  const { data: perms } = await supabase
    .from("permissions")
    .select("*")
    .in("id", permIds);

  return {
    ...role,
    permissions: perms || [],
  };
};
