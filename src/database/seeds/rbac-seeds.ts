/**
 * DATABASE SEEDS - ROLES AND PERMISSIONS
 * 
 * Run this manually or add to your seeding script
 * Usage in Node:
 * import { seedRolesAndPermissions } from './seeds/rbac-seeds.js';
 * await seedRolesAndPermissions();
 */

import { supabase } from "../../core/db.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

const ROLES = [
  {
    name: "admin",
    description: "Administrador con acceso total al sistema",
  },
  {
    name: "manager",
    description: "Gerente con permisos extendidos",
  },
  {
    name: "accountant",
    description: "Contador con acceso a gastos y reportes",
  },
  {
    name: "employee",
    description: "Empleado con permisos básicos",
  },
  {
    name: "viewer",
    description: "Solo lectura en la mayoría de recursos",
  },
];

const ROLE_PERMISSIONS: Record<string, (typeof PERMISSIONS)[keyof typeof PERMISSIONS][]> = {
  admin: Object.values(PERMISSIONS), // Admin tiene todos los permisos

  manager: [
    PERMISSIONS.ENTERPRISE_READ,
    PERMISSIONS.ENTERPRISE_CREATE,
    PERMISSIONS.ENTERPRISE_UPDATE,
    PERMISSIONS.ENTERPRISE_LIST,
    PERMISSIONS.EXPENSE_READ,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_UPDATE,
    PERMISSIONS.EXPENSE_LIST,
    PERMISSIONS.EXPENSE_APPROVE,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_UPDATE,
    PERMISSIONS.QUOTE_LIST,
    PERMISSIONS.BIOMETRIC_READ,
    PERMISSIONS.BIOMETRIC_CREATE,
    PERMISSIONS.BIOMETRIC_UPDATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.TENANT_READ,
  ],

  accountant: [
    PERMISSIONS.ENTERPRISE_READ,
    PERMISSIONS.ENTERPRISE_LIST,
    PERMISSIONS.EXPENSE_READ,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_UPDATE,
    PERMISSIONS.EXPENSE_LIST,
    PERMISSIONS.EXPENSE_APPROVE,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_LIST,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_VIEW_LOGS,
  ],

  employee: [
    PERMISSIONS.ENTERPRISE_READ,
    PERMISSIONS.ENTERPRISE_LIST,
    PERMISSIONS.EXPENSE_READ,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_LIST,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_LIST,
    PERMISSIONS.BIOMETRIC_READ,
    PERMISSIONS.BIOMETRIC_CREATE,
  ],

  viewer: [
    PERMISSIONS.ENTERPRISE_READ,
    PERMISSIONS.ENTERPRISE_LIST,
    PERMISSIONS.EXPENSE_READ,
    PERMISSIONS.EXPENSE_LIST,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.QUOTE_LIST,
  ],
};

export const seedRolesAndPermissions = async () => {
  try {
    console.log("🌱 Iniciando seed de roles y permisos...");

    // 1. Insertar todos los permisos
    console.log("📝 Insertando permisos...");
    const permissionNames = Object.values(PERMISSIONS);

    const { data: existingPermissions, error: fetchError } = await supabase
      .from("permissions")
      .select("name")
      .in("name", permissionNames);

    if (fetchError) {
      console.error("❌ Error al verificar permisos existentes:", fetchError);
      throw fetchError;
    }

    const existingPermNames = (existingPermissions || []).map((p) => p.name);
    const permissionsToInsert = permissionNames.filter(
      (name) => !existingPermNames.includes(name)
    );

    if (permissionsToInsert.length > 0) {
      const { error: insertPermError } = await supabase
        .from("permissions")
        .insert(
          permissionsToInsert.map((name) => ({
            name,
            description: `Permiso: ${name}`,
          }))
        );

      if (insertPermError) {
        console.error("❌ Error al insertar permisos:", insertPermError);
        throw insertPermError;
      }

      console.log(`✅ ${permissionsToInsert.length} permisos insertados`);
    } else {
      console.log("✅ Todos los permisos ya existen");
    }

    // 2. Insertar roles
    console.log("👥 Insertando roles...");

    const { data: existingRoles, error: fetchRolesError } = await supabase
      .from("roles")
      .select("name");

    if (fetchRolesError) {
      console.error("❌ Error al verificar roles existentes:", fetchRolesError);
      throw fetchRolesError;
    }

    const existingRoleNames = (existingRoles || []).map((r) => r.name);
    const rolesToInsert = ROLES.filter((role) => !existingRoleNames.includes(role.name));

    if (rolesToInsert.length > 0) {
      const { error: insertRoleError } = await supabase
        .from("roles")
        .insert(rolesToInsert);

      if (insertRoleError) {
        console.error("❌ Error al insertar roles:", insertRoleError);
        throw insertRoleError;
      }

      console.log(`✅ ${rolesToInsert.length} roles insertados`);
    } else {
      console.log("✅ Todos los roles ya existen");
    }

    // 3. Obtener IDs de roles y permisos
    console.log("🔗 Vinculando roles con permisos...");

    const { data: allRoles } = await supabase.from("roles").select("id, name");
    const { data: allPermissions } = await supabase
      .from("permissions")
      .select("id, name");

    const roleMap = (allRoles || []).reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {} as Record<string, number>);

    const permissionMap = (allPermissions || []).reduce((acc, perm) => {
      acc[perm.name] = perm.id;
      return acc;
    }, {} as Record<string, number>);

    // 4. Asignar permisos a roles
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = roleMap[roleName];
      if (!roleId) {
        console.warn(`⚠️ Rol no encontrado: ${roleName}`);
        continue;
      }

      // Obtener permisos ya asignados a este rol
      const { data: existingAssignments } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", roleId);

      const assignedPermIds = (existingAssignments || []).map((ra) => ra.permission_id);

      // Preparar nuevas asignaciones
      const newAssignments = permissions
        .map((permName) => permissionMap[permName])
        .filter(
          (permId) => permId && !assignedPermIds.includes(permId)
        ) as number[];

      if (newAssignments.length > 0) {
        const { error: assignError } = await supabase
          .from("role_permissions")
          .insert(newAssignments.map((permId) => ({ role_id: roleId, permission_id: permId })));

        if (assignError) {
          console.error(`❌ Error al asignar permisos a ${roleName}:`, assignError);
          throw assignError;
        }

        console.log(`✅ ${roleName}: ${newAssignments.length} permisos asignados`);
      } else {
        console.log(`✅ ${roleName}: permisos ya asignados`);
      }
    }

    console.log("🎉 Seed completado exitosamente");
  } catch (error) {
    console.error("❌ Error en seedRolesAndPermissions:", error);
    throw error;
  }
};

/**
 * Asignar rol "admin" a un usuario específico
 */
export const makeUserAdmin = async (userId: number) => {
  try {
    // Obtener ID del rol admin
    const { data: adminRole, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (roleError || !adminRole) {
      throw new Error("Rol admin no encontrado");
    }

    // Asignar rol al usuario
    const { error: assignError } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role_id: adminRole.id }]);

    if (assignError) {
      throw assignError;
    }

    console.log(`✅ Usuario ${userId} es ahora admin`);
  } catch (error) {
    console.error("❌ Error en makeUserAdmin:", error);
    throw error;
  }
};
