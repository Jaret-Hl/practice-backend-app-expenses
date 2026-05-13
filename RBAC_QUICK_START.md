/**
 * QUICK INTEGRATION CHECKLIST
 * Pasos exactos para integrar RBAC en tu app
 */

/**
 * PASO 1: En tu archivo main (index.ts o server.ts)
 * =====================================================
 */

// Agregar este import
import { seedRolesAndPermissions } from "./database/seeds/rbac-seeds.js";

// En tu startup (una sola vez):
async function main() {
  // ... tu código de inicialización

  // Ejecutar seed una sola vez (comentar después)
  try {
    await seedRolesAndPermissions();
    console.log("✅ RBAC seeds ejecutadas");
  } catch (error) {
    console.error("❌ Error en seeds:", error);
  }

  // ... resto de código
}

/**
 * PASO 2: Importaciones en auth.routes.ts
 * =====================================================
 */

// ANTES:
// import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

// DESPUÉS:
// import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
// import { authorize, authorizeAny } from "../../shared/middlewares/authorization.middleware.js";
// import { PERMISSIONS } from "../../shared/constants/permissions.js";

/**
 * PASO 3: Actualizar routes en enterprises.routes.ts
 * =====================================================
 */

// ANTES:
/*
import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import * as controller from "./enterprises.controller.js";

const router = Router();

router.get("/", authMiddleware, controller.getEnterprises);
router.get("/:id", authMiddleware, controller.getEnterpriseById);
router.post("/", authMiddleware, controller.createEnterprise);
router.patch("/:id", authMiddleware, controller.updateEnterprise);
router.delete("/:id", authMiddleware, controller.deleteEnterprise);

export default router;
*/

// DESPUÉS:
/*
import { Router } from "express";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { authorize, authorizeAny } from "../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import * as controller from "./enterprises.controller.js";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_LIST]),
  controller.getEnterprises
);

router.get(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  controller.getEnterpriseById
);

router.post(
  "/",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_CREATE]),
  controller.createEnterprise
);

router.patch(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_UPDATE]),
  controller.updateEnterprise
);

router.delete(
  "/:id",
  authenticateJWT,
  authorize([PERMISSIONS.ENTERPRISE_DELETE]),
  controller.deleteEnterprise
);

export default router;
*/

/**
 * PASO 4: Actualizar expenses.routes.ts
 * =====================================================
 */

// PATRÓN SIMILAR A ENTERPRISES
// - List: authorize([PERMISSIONS.EXPENSE_LIST])
// - Get:  authorize([PERMISSIONS.EXPENSE_READ])
// - Post: authorize([PERMISSIONS.EXPENSE_CREATE])
// - Patch: authorize([PERMISSIONS.EXPENSE_UPDATE])
// - Delete: authorize([PERMISSIONS.EXPENSE_DELETE])
// - Approve: authorize([PERMISSIONS.EXPENSE_APPROVE])

/**
 * PASO 5: Actualizar quotes.routes.ts
 * =====================================================
 */

// PATRÓN SIMILAR
// - List: authorize([PERMISSIONS.QUOTE_LIST])
// - Get:  authorize([PERMISSIONS.QUOTE_READ])
// - Post: authorize([PERMISSIONS.QUOTE_CREATE])
// - Patch: authorize([PERMISSIONS.QUOTE_UPDATE])
// - Delete: authorize([PERMISSIONS.QUOTE_DELETE])

/**
 * PASO 6: Actualizar biometrics.routes.ts
 * =====================================================
 */

// - List: authorize([PERMISSIONS.BIOMETRIC_READ])
// - Get:  authorize([PERMISSIONS.BIOMETRIC_READ])
// - Post: authorize([PERMISSIONS.BIOMETRIC_CREATE])
// - Patch: authorize([PERMISSIONS.BIOMETRIC_UPDATE])
// - Delete: authorize([PERMISSIONS.BIOMETRIC_DELETE])

/**
 * PASO 7: Actualizar tenants.routes.ts
 * =====================================================
 */

// - List: authorize([PERMISSIONS.TENANT_READ])
// - Get:  authorize([PERMISSIONS.TENANT_READ])
// - Post: authorize([PERMISSIONS.TENANT_CREATE])
// - Patch: authorize([PERMISSIONS.TENANT_UPDATE])
// - Delete: authorize([PERMISSIONS.TENANT_DELETE])

/**
 * PASO 8: Test del login
 * =====================================================
 */

/*
1. POST /api/auth/login
   Request: { email: "user@example.com", password: "password" }
   
   Response (esperada):
   {
     user: {
       id: 1,
       email: "user@example.com",
       name: "User Name",
       roles: ["manager"],
       permissions: ["enterprise.read", "expense.create", ...],
       isAdmin: false
     },
     token: "eyJhbGc...",
     refreshToken: "eyJhbGc..."
   }

2. GET /api/enterprises
   Header: Authorization: Bearer <token>
   
   Response: 200 OK (si tiene permiso enterprise.list)
   Response: 403 Forbidden (si no tiene permiso)

3. POST /api/enterprises (sin permiso)
   Respuesta esperada: 403 { error: "Acceso denegado", ... }
*/

/**
 * PASO 9: Admin bypass test
 * =====================================================
 */

/*
1. Asignar rol admin a un usuario:
   import { makeUserAdmin } from "./database/seeds/rbac-seeds.js";
   await makeUserAdmin(1); // userId = 1

2. Login con ese usuario
   - Debe tener roles: ["admin"]
   - isAdmin: true
   - Debe poder acceder a cualquier endpoint
*/

/**
 * PASO 10: Crear endpoint de admin (opcional)
 * =====================================================
 */

// En un nuevo archivo admin.routes.ts:
/*
import { Router } from "express";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
import { requireAdmin } from "../../shared/middlewares/authorization.middleware.js";

const router = Router();

// Solo admin puede acceder
router.get(
  "/users",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    const { getUserProfile } = await import("../../core/security/admin.service.js");
    const profile = await getUserProfile(req.user!.id);
    res.json(profile);
  }
);

export default router;
*/

/**
 * RESUMEN - CAMBIOS MÍNIMOS REQUERIDOS:
 * ====================================================
 */

// 1. Reemplazar authMiddleware por authenticateJWT
// 2. Agregar authorize([PERMISSIONS.XXX]) a cada ruta
// 3. Ejecutar seedRolesAndPermissions() al startup
// 4. Cambios en jwt.ts: ✅ (ya hecho)
// 5. Cambios en auth.middleware.ts: ✅ (ya hecho)
// 6. Cambios en auth.controller.ts: ✅ (ya hecho)
// 7. Cambios en express.d.ts: ✅ (ya hecho)

/**
 * ARCHIVOS NUEVOS CREADOS:
 * ====================================================
 * ✅ src/shared/constants/permissions.ts
 * ✅ src/types/rbac.ts
 * ✅ src/core/security/rbac.service.ts
 * ✅ src/core/security/admin.service.ts
 * ✅ src/shared/middlewares/authorization.middleware.ts
 * ✅ src/database/seeds/rbac-seeds.ts
 * ✅ src/shared/examples/rbac-routes.example.ts
 */

/**
 * Tiempo estimado de integración: 15-20 minutos
 */
