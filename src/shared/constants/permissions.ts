/**
 * PERMISSION CONSTANTS
 * Define all permissions in the system
 * Format: "resource.action"
 */

export const PERMISSIONS = {
  // Enterprise permissions
  ENTERPRISE_READ: "enterprises:read",
  ENTERPRISE_CREATE: "enterprises:create",
  ENTERPRISE_UPDATE: "enterprises:update",
  ENTERPRISE_DELETE: "enterprises:delete",
  ENTERPRISE_LIST: "enterprises:list",

  // Expense permissions
  EXPENSE_READ: "expense:read",
  EXPENSE_CREATE: "expense:create",
  EXPENSE_UPDATE: "expense:update",
  EXPENSE_DELETE: "expense:delete",
  EXPENSE_LIST: "expense:list",
  EXPENSE_APPROVE: "expense:approve",

  // Quote permissions
  QUOTE_READ: "quote:read",
  QUOTE_CREATE: "quote:create",
  QUOTE_UPDATE: "quote:update",
  QUOTE_DELETE: "quote:delete",
  QUOTE_LIST: "quote:list",

  // Biometric permissions
  BIOMETRIC_READ: "biometrics:read",
  BIOMETRIC_CREATE: "biometrics:create",
  BIOMETRIC_UPDATE: "biometrics:update",
  BIOMETRIC_DELETE: "biometrics:delete",

  // User/Admin permissions
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE_ROLES: "user:manage_roles",

  // Tenant permissions
  TENANT_READ: "tenants:read",
  TENANT_CREATE: "tenants:create",
  TENANT_UPDATE: "tenants:update",
  TENANT_DELETE: "tenants:delete",
  TENANT_MANAGE: "tenants:manage",

  // Risk rate permissions
  RISKRATE_READ: "riskrates:read",
  RISKRATE_CREATE: "riskrates:create",
  RISKRATE_UPDATE: "riskrates:update",
  RISKRATE_DELETE: "riskrates:delete",
  RISKRATE_MANAGE: "riskrates:manage",

  // Hardware Devices permissions
  HARDWARE_DEVICES_READ: "hardwaredevices:read",
  
  // RBAC Management permissions
  RBAC_MANAGE_ROLES: "rbac:manage_roles",
  RBAC_MANAGE_PERMISSIONS: "rbac:manage_permissions",
  RBAC_ASSIGN_ROLES: "rbac:assign_roles",

  // Audit permissions
  AUDIT_READ: "audit:read",
  AUDIT_VIEW_LOGS: "audit:view_logs",
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
export const getPermissionsByResource = (
  resource: string,
): PermissionValue[] => {
  return getAllPermissions().filter((p) => p.startsWith(resource));
};
