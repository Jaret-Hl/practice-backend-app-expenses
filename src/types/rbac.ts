/**
 * RBAC Types and Interfaces
 */

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface UserWithRolesAndPermissions {
  id: number;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
}

/**
 * Request context after authentication and authorization
 */
export interface AuthorizedRequest {
  id: number;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
}

export interface RBACResult {
  success: boolean;
  hasPermission: boolean;
  isAdmin: boolean;
  reason?: string;
}
