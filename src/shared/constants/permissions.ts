/**
 * PERMISSION CONSTANTS
 * Define all permissions in the system
 * Format: "resource.action"
 */

export const PERMISSIONS = {
  // Enterprise permissions
  ENTERPRISE_READ: "enterprise.read",
  ENTERPRISE_CREATE: "enterprise.create",
  ENTERPRISE_UPDATE: "enterprise.update",
  ENTERPRISE_DELETE: "enterprise.delete",
  ENTERPRISE_LIST: "enterprise.list",

  // Expense permissions
  EXPENSE_READ: "expense.read",
  EXPENSE_CREATE: "expense.create",
  EXPENSE_UPDATE: "expense.update",
  EXPENSE_DELETE: "expense.delete",
  EXPENSE_LIST: "expense.list",
  EXPENSE_APPROVE: "expense.approve",

  // Quote permissions
  QUOTE_READ: "quote.read",
  QUOTE_CREATE: "quote.create",
  QUOTE_UPDATE: "quote.update",
  QUOTE_DELETE: "quote.delete",
  QUOTE_LIST: "quote.list",

  // Biometric permissions
  BIOMETRIC_READ: "biometric.read",
  BIOMETRIC_CREATE: "biometric.create",
  BIOMETRIC_UPDATE: "biometric.update",
  BIOMETRIC_DELETE: "biometric.delete",

  // User/Admin permissions
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_MANAGE_ROLES: "user.manage_roles",

  // Tenant permissions
  TENANT_READ: "tenant.read",
  TENANT_CREATE: "tenant.create",
  TENANT_UPDATE: "tenant.update",
  TENANT_DELETE: "tenant.delete",
  TENANT_MANAGE: "tenant.manage",

  // Audit permissions
  AUDIT_READ: "audit.read",
  AUDIT_VIEW_LOGS: "audit.view_logs",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

/**
 * Get all permission values as array
 */
export const getAllPermissions = (): PermissionValue[] => {
  return Object.values(PERMISSIONS);
};

/**
 * Get permissions by resource
 */
export const getPermissionsByResource = (resource: string): PermissionValue[] => {
  return getAllPermissions().filter((p) => p.startsWith(resource));
};
