/**
 * RBAC INTEGRATION TEST & VALIDATION CHECKLIST
 * 
 * Sigue estos pasos para validar que el RBAC está correctamente integrado
 */

# 🔍 RBAC Integration Validation Guide

## PARTE 1: VERIFICACIÓN INICIAL

### 1.1 Compilación
```bash
pnpm run build
```
**Esperado**: ✅ Compilación exitosa sin errores

**Si hay errores**: 
- Verifica que todos los archivos fueron creados
- Verifica imports en rutas relativas
- Revisa tipos en `src/types/express.d.ts`

### 1.2 Estructura de Carpetas
```
✅ src/shared/constants/permissions.ts
✅ src/types/rbac.ts
✅ src/core/security/rbac.service.ts
✅ src/core/security/admin.service.ts
✅ src/shared/middlewares/authorization.middleware.ts
✅ src/database/seeds/rbac-seeds.ts
```

## PARTE 2: INTEGRACIÓN EN CÓDIGO ACTIVO

### 2.1 Reemplazar archivos de rutas

Para cada módulo, reemplaza el contenido del archivo `.routes.ts` con la versión `*_UPDATED.ts`:

```
modules/enterprises/enterprises.routes.ts ← ENTERPRISES_ROUTES_UPDATED.ts
modules/expenses/expenses.routes.ts ← EXPENSES_ROUTES_UPDATED.ts
modules/quotes/quotes.routes.ts ← QUOTES_ROUTES_UPDATED.ts
modules/biometrics/biometric.routes.ts ← BIOMETRIC_ROUTES_UPDATED.ts
modules/tenants/tenant.routes.ts ← TENANT_ROUTES_UPDATED.ts
```

**O manualmente**, en cada archivo `*.routes.ts`:

```typescript
// CAMBIO 1: Import
- import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
+ import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";
+ import { authorize } from "../../shared/middlewares/authorization.middleware.js";
+ import { PERMISSIONS } from "../../shared/constants/permissions.js";

// CAMBIO 2: En cada ruta
- router.get("/", authMiddleware, controller.getAll);
+ router.get(
+   "/",
+   authenticateJWT,
+   authorize([PERMISSIONS.RESOURCE_LIST]),
+   controller.getAll
+ );
```

### 2.2 Inicializar Seeds en tu app

En `src/index.ts` o donde inicies tu app:

```typescript
import { seedRolesAndPermissions } from './database/seeds/rbac-seeds.js';

async function main() {
  try {
    // LÍNEA CRÍTICA - ejecutar UNA SOLA VEZ
    console.log('Inicializando RBAC...');
    await seedRolesAndPermissions();
    console.log('✅ RBAC inicializado');
  } catch (error) {
    console.error('⚠️ Seed ya ejecutado o error:', error);
    // No es error fatal, continuar
  }

  // ... resto de startup
}

main();
```

### 2.3 Compilar de nuevo
```bash
pnpm run build
```

## PARTE 3: TESTING

### 3.1 Test Login (básico)

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Esperado:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["viewer"],           # ← NUEVO
    "permissions": ["..."],        # ← NUEVO
    "isAdmin": false              # ← NUEVO
  },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3.2 Test Con Permiso (200 OK)

```bash
# 1. Obtén el token del login anterior
TOKEN="eyJhbGc..."

# 2. Accede a recurso con permiso
curl -X GET http://localhost:3000/api/enterprises \
  -H "Authorization: Bearer $TOKEN"

# Esperado: 200 + datos
{
  "data": [...],
  "page": 1,
  ...
}
```

### 3.3 Test Sin Permiso (403 Forbidden)

```bash
# Usa usuario con rol "viewer" (solo lectura)
curl -X POST http://localhost:3000/api/enterprises \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","..."}'

# Esperado: 403
{
  "error": "Acceso denegado",
  "message": "Missing permissions: enterprise.create",
  "requiredPermissions": ["enterprise.create"],
  "userPermissions": ["enterprise.read", "enterprise.list", ...]
}
```

### 3.4 Test Admin Bypass

```bash
# 1. Hacer admin a un usuario
# En tu console/script:
import { makeUserAdmin } from './database/seeds/rbac-seeds.js';
await makeUserAdmin(1);

# 2. Login con ese usuario
# El token debe tener: isAdmin: true

# 3. Hacer request (cualquier permiso)
curl -X POST http://localhost:3000/api/enterprises \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  ...

# Esperado: 201 ✅ (sin 403)
```

### 3.5 Test Sin Token (401 Unauthorized)

```bash
curl -X GET http://localhost:3000/api/enterprises

# Esperado: 401
{
  "error": "Token no proporcionado"
}
```

## PARTE 4: VALIDACIÓN DE BD

### 4.1 Verificar Roles en BD

```sql
-- En Supabase SQL Editor
SELECT * FROM roles;
-- Esperado:
-- id | name       | description
-- 1  | admin      | Administrador...
-- 2  | manager    | Gerente...
-- 3  | accountant | Contador...
-- 4  | employee   | Empleado...
-- 5  | viewer     | Solo lectura...
```

### 4.2 Verificar Permisos

```sql
SELECT COUNT(*) FROM permissions;
-- Esperado: 47 permisos
```

### 4.3 Verificar Asignaciones

```sql
-- Permisos del rol admin
SELECT p.name FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
WHERE rp.role_id = 1;
-- Esperado: 47 filas (todos los permisos)

-- Permisos del rol viewer
SELECT p.name FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
WHERE rp.role_id = 5;
-- Esperado: 6 filas (solo lectura)
```

### 4.4 Roles de Usuario

```sql
SELECT u.email, r.name FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'user@example.com';
-- Esperado: al menos 1 rol por usuario
```

## PARTE 5: DEBUGGING

### 5.1 Ver permisos en JWT

```typescript
// En un middleware, después de authMiddleware
console.log('User info:', req.user);
// Output:
// {
//   id: 1,
//   email: 'user@example.com',
//   roles: ['manager'],
//   permissions: ['enterprise.read', 'enterprise.create', ...],
//   isAdmin: false
// }
```

### 5.2 Ver errores de permisos

Habilita logs en `authorization.middleware.ts`:

```typescript
const result = checkPermissions(userPermissions, requiredPermissions, isAdmin);
console.log('Permission check:', {
  required: requiredPermissions,
  user: userPermissions,
  admin: isAdmin,
  result: result.hasPermission
});
```

### 5.3 Verificar asignación de rol

```typescript
import { getUserRolesAndPermissions } from './core/security/rbac.service.js';

const user = await getUserRolesAndPermissions(1);
console.log(user);
// Output debe mostrar roles y permissions del usuario
```

## PARTE 6: OPERACIONES ADMIN (Opcionales)

### 6.1 Crear nuevo rol

```typescript
import { createRoleWithPermissions } from './core/security/admin.service.js';

await createRoleWithPermissions(
  'auditor',
  'Auditor de gastos',
  ['expense.read', 'expense.list', 'audit.read']
);
```

### 6.2 Asignar múltiples roles a usuario

```typescript
import { assignMultipleRolesToUser } from './core/security/admin.service.js';

await assignMultipleRolesToUser(userId, ['manager', 'accountant']);
```

### 6.3 Ver jerarquía de roles

```typescript
import { getRoleHierarchy } from './core/security/admin.service.js';

const hierarchy = await getRoleHierarchy();
console.table(hierarchy);
```

## PARTE 7: CHECKLIST FINAL

- [ ] TypeScript compila sin errores
- [ ] Seeds ejecutados (roles y permisos en BD)
- [ ] Rutas actualizadas con nuevo middleware
- [ ] Login retorna roles y permissions
- [ ] Request con permiso: 200 OK
- [ ] Request sin permiso: 403 Forbidden
- [ ] Admin bypass funciona
- [ ] Request sin token: 401 Unauthorized
- [ ] BD verificada (roles, permissions, user_roles)
- [ ] Logs muestran información correcta
- [ ] Documentación revisada

## 🚨 PROBLEMAS COMUNES

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Cannot find module` | Imports incorrectos | Verifica rutas relativas en archivos creados |
| `Property does not exist` | Tipos desactualizados | Ejecuta `pnpm run build` |
| 403 en todo | Permisos no en BD | Verifica que seeds ejecutaron |
| 401 en login | JWT secret incorrecta | Verifica ENV.JWT_SECRET |
| Admin no tiene bypass | isAdmin: false | Verifica que Usuario tiene rol "admin" |
| Permisos no actualizan | Token cached | User debe hacer logout/login |

## 📞 SOPORTE

Si tienes problemas:
1. Verifica la sección RBAC_IMPLEMENTATION.md
2. Revisa logs de compilación TypeScript
3. Valida estructura en BD (Supabase console)
4. Usa console.log para debuggear req.user

## ✨ SIGUIENTES PASOS (Opcionales)

- [ ] Implementar RBAC audit logs
- [ ] Agregar cacheo de roles/permisos
- [ ] Crear endpoint admin para gestión de roles
- [ ] Implementar permission scoping por tenant
- [ ] Agregar rate limiting por rol
