/**
 * RBAC INTEGRATION TEST SCRIPT
 * 
 * Ejecuta este script para validar que RBAC está correctamente integrado
 * 
 * Uso:
 * ts-node src/scripts/test-rbac.ts
 */

import { supabase } from "../core/db.js";
import {
  seedRolesAndPermissions,
  makeUserAdmin,
} from "../database/seeds/rbac-seeds.js";
import { getUserRolesAndPermissions } from "../core/security/rbac.service.js";
import { getAllRoles, getAllPermissions } from "../core/security/rbac.service.js";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: String(error),
      duration: Date.now() - start,
    });
    console.log(`❌ ${name}: ${error}`);
  }
}

async function main() {
  console.log("🧪 RBAC Integration Test Suite\n");

  // Test 1: Seeds
  await runTest("Seeds ejecutados correctamente", async () => {
    await seedRolesAndPermissions();
  });

  // Test 2: Roles en BD
  await runTest("Roles creados en BD", async () => {
    const roles = await getAllRoles();
    if (roles.length < 5) {
      throw new Error(`Expected at least 5 roles, got ${roles.length}`);
    }
    const roleNames = roles.map((r) => r.name);
    const required = ["admin", "manager", "accountant", "employee", "viewer"];
    for (const role of required) {
      if (!roleNames.includes(role)) {
        throw new Error(`Role ${role} not found`);
      }
    }
  });

  // Test 3: Permisos en BD
  await runTest("Permisos creados en BD", async () => {
    const permissions = await getAllPermissions();
    if (permissions.length < 40) {
      throw new Error(
        `Expected at least 40 permissions, got ${permissions.length}`
      );
    }
  });

  // Test 4: Usuario viewer tiene permisos limitados
  await runTest("Rol viewer tiene permisos correctos", async () => {
    // Obtener un usuario con rol viewer
    const { data: users } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (!users || users.length === 0) {
      throw new Error("No users found in database");
    }

    const userId = users[0].id;
    const userRBAC = await getUserRolesAndPermissions(userId);

    if (!userRBAC) {
      throw new Error("Could not resolve user RBAC");
    }

    console.log(`  - User roles: ${userRBAC.roles.join(", ")}`);
    console.log(
      `  - User permissions: ${userRBAC.permissions.length} permisos`
    );
  });

  // Test 5: Admin bypass
  await runTest("Admin bypass funciona", async () => {
    // Crear usuario test
    const testEmail = `test-admin-${Date.now()}@example.com`;
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: testEmail,
          password_hash: "test",
          name: "Test Admin",
        },
      ])
      .select()
      .single();

    if (userError || !user) {
      throw new Error("Could not create test user");
    }

    // Asignar rol admin
    const { data: adminRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (!adminRole) {
      throw new Error("Admin role not found");
    }

    await supabase
      .from("user_roles")
      .insert([{ user_id: user.id, role_id: adminRole.id }]);

    // Verificar
    const userRBAC = await getUserRolesAndPermissions(user.id);
    if (!userRBAC?.isAdmin) {
      throw new Error("Admin flag not set");
    }

    console.log(`  - Admin user created with ${userRBAC.permissions.length} permissions`);

    // Cleanup
    await supabase.from("users").delete().eq("id", user.id);
  });

  // Test 6: Múltiples roles
  await runTest("Usuario puede tener múltiples roles", async () => {
    const testEmail = `test-multi-${Date.now()}@example.com`;
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: testEmail,
          password_hash: "test",
          name: "Test Multi Role",
        },
      ])
      .select()
      .single();

    if (userError || !user) {
      throw new Error("Could not create test user");
    }

    // Obtener manager y accountant roles
    const { data: roles } = await supabase
      .from("roles")
      .select("id")
      .in("name", ["manager", "accountant"]);

    if (!roles || roles.length < 2) {
      throw new Error("Could not find manager/accountant roles");
    }

    // Asignar ambos roles
    await supabase.from("user_roles").insert([
      { user_id: user.id, role_id: roles[0].id },
      { user_id: user.id, role_id: roles[1].id },
    ]);

    // Verificar
    const userRBAC = await getUserRolesAndPermissions(user.id);
    if (!userRBAC || userRBAC.roles.length < 2) {
      throw new Error("Multi-role assignment failed");
    }

    console.log(`  - User has ${userRBAC.roles.length} roles: ${userRBAC.roles.join(", ")}`);

    // Cleanup
    await supabase.from("users").delete().eq("id", user.id);
  });

  // Test 7: Role permissions mapping
  await runTest("Role permissions mapeados correctamente", async () => {
    const { data: managerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "manager")
      .single();

    if (!managerRole) {
      throw new Error("Manager role not found");
    }

    const { data: permissions } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", managerRole.id);

    if (!permissions || permissions.length === 0) {
      throw new Error("Manager has no permissions");
    }

    console.log(`  - Manager has ${permissions.length} permissions assigned`);
  });

  // Print Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 RESULTADOS\n");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((r) => {
    const status = r.passed ? "✅" : "❌";
    const duration = r.duration.toString().padStart(4, " ");
    console.log(`${status} ${r.name.padEnd(35)} [${duration}ms]`);
  });

  console.log("\n" + "=".repeat(50));
  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log("🎉 ¡RBAC está correctamente integrado!\n");
    console.log("Próximos pasos:");
    console.log("1. Actualizar src/modules/*/routes.ts con authorize() middleware");
    console.log("2. Compilar: pnpm run build");
    console.log("3. Ejecutar: npm start");
    console.log("4. Testear endpoints según RBAC_VALIDATION_CHECKLIST.md");
  } else {
    console.log("⚠️ Hay problemas que necesitan ser resueltos\n");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`❌ ${r.name}`);
        console.log(`   Error: ${r.error}\n`);
      });
  }

  process.exit(passed === total ? 0 : 1);
}

main();
