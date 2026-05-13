# 🔐 RBAC Implementation Guide

## 📁 Estructura de Carpetas Creada

```
src/
├── core/
│   └── security/
│       ├── rbac.service.ts          # Servicios RBAC principales
│       ├── admin.service.ts         # Utilidades para administradores
│       └── jwt.ts                   # (Actualizado) JWT con roles/permisos
├── shared/
│   ├── constants/
│   │   └── permissions.ts           # Definición de permisos
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # (Actualizado) Autenticación con RBAC
│   │   └── authorization.middleware.ts  # Nuevos middlewares de autorización
│   └── examples/
│       └── rbac-routes.example.ts   # Ejemplos de rutas protegidas
├── types/
│   ├── express.d.ts                 # (Actualizado) Tipos Express
│   └── rbac.ts                      # Tipos RBAC
└── database/
    └── seeds/
        └── rbac-seeds.ts            # Seeds de roles y permisos
```

## 🚀 Integración Rápida

### 1. **Ejecutar Seeds (Una sola vez)**

En tu archivo principal (index.ts):

```typescript
import { seedRolesAndPermissions, makeUserAdmin } from './database/seeds/rbac-seeds.js';

// Al iniciar la app (solo la primera vez)
await seedRolesAndPermissions();

// Opcional: Hacer un usuario admin
// await makeUserAdmin(1); // userId = 1
```

### 2. **Actualizar rutas existentes**

**ANTES:**
```typescript
app.get('/api/enterprises/:id', authMiddleware, controller.getEnterprise);
```

**DESPUÉS:**
```typescript
import { authorize } from './shared/middlewares/authorization.middleware.js';
import { PERMISSIONS } from './shared/constants/permissions.js';

app.get(
  '/api/enterprises/:id',
  authMiddleware,
  authorize([PERMISSIONS.ENTERPRISE_READ]),
  controller.getEnterprise
);
```

### 3. **En tu controller, accede a la info del usuario**

```typescript
export const getEnterprise = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRoles = req.user?.roles; // ['manager', 'accountant']
  const userPermissions = req.user?.permissions; // ['enterprise.read', 'expense.create', ...]
  const isAdmin = req.user?.isAdmin; // boolean

  // Tu lógica...
};
```

## 📚 Middlewares Disponibles

### **authorize(permissions: string[])**
Requiere que el usuario tenga TODOS los permisos

```typescript
authorize([PERMISSIONS.ENTERPRISE_CREATE, PERMISSIONS.ENTERPRISE_UPDATE])
```

### **authorizeAny(permissions: string[])**
Requiere que el usuario tenga AL MENOS UNO de los permisos

```typescript
authorizeAny([PERMISSIONS.TENANT_MANAGE, PERMISSIONS.USER_MANAGE_ROLES])
```

### **requireAdmin**
Solo administradores

```typescript
requireAdmin
```

### **requireRole(roles: string[])**
Requiere uno de los roles especificados

```typescript
requireRole(['manager', 'accountant'])
```

## 🔑 Permisos Disponibles

```
ENTERPRISE:
- enterprise.read      # Leer empresas
- enterprise.create    # Crear empresas
- enterprise.update    # Actualizar empresas
- enterprise.delete    # Eliminar empresas
- enterprise.list      # Listar empresas

EXPENSE:
- expense.read         # Leer gastos
- expense.create       # Crear gastos
- expense.update       # Actualizar gastos
- expense.delete       # Eliminar gastos
- expense.list         # Listar gastos
- expense.approve      # Aprobar gastos

QUOTE:
- quote.read
- quote.create
- quote.update
- quote.delete
- quote.list

BIOMETRIC:
- biometric.read
- biometric.create
- biometric.update
- biometric.delete

USER:
- user.read
- user.update
- user.delete
- user.manage_roles

TENANT:
- tenant.read
- tenant.create
- tenant.update
- tenant.delete
- tenant.manage

AUDIT:
- audit.read
- audit.view_logs
```

## 👥 Roles y Permisos Predefinidos

### **admin**
- ✅ TODOS los permisos
- Admin bypass automático

### **manager**
- Empresas: read, create, update, list
- Gastos: read, create, update, list, approve
- Quotes: read, create, update, list
- Biometrics: read, create, update
- Usuarios: read
- Tenants: read

### **accountant**
- Empresas: read, list
- Gastos: read, create, update, list, approve
- Quotes: read, list
- Auditoría: read, view_logs

### **employee**
- Empresas: read, list
- Gastos: read, create, list
- Quotes: read, list
- Biometrics: read, create

### **viewer**
- Solo lectura: empresas, gastos, quotes

## 🛠️ Operaciones Admin

### **Ver jerarquía de roles**
```typescript
import { getRoleHierarchy } from './core/security/admin.service.js';

const hierarchy = await getRoleHierarchy();
// [
//   {
//     role: 'admin',
//     description: 'Administrador...',
//     permissionCount: 47,
//     permissions: ['enterprise.read', 'enterprise.create', ...]
//   },
//   ...
// ]
```

### **Ver perfil de usuario**
```typescript
import { getUserProfile } from './core/security/admin.service.js';

const profile = await getUserProfile(userId);
// { id, email, name, created_at, roles: ['manager', 'accountant'] }
```

### **Asignar roles a usuario**
```typescript
import { assignMultipleRolesToUser } from './core/security/admin.service.js';

await assignMultipleRolesToUser(userId, ['manager', 'accountant']);
```

### **Crear nuevo rol con permisos**
```typescript
import { createRoleWithPermissions } from './core/security/admin.service.js';

await createRoleWithPermissions(
  'auditor',
  'Auditor de gastos',
  ['audit.read', 'expense.read', 'enterprise.read']
);
```

## 🔐 Flujo de Login Actualizado

```
1. Usuario envía: { email, password }
2. Backend valida credenciales
3. Backend resuelve roles y permisos del usuario
4. JWT se genera CON roles y permisos incluidos:
   {
     sub: 1,
     email: "user@example.com",
     roles: ["manager"],
     permissions: ["enterprise.read", "expense.create", ...],
     isAdmin: false,
     iat: ...,
     exp: ...
   }
5. Cliente recibe token + user con roles/permisos
6. Cliente incluye token en Authorization: Bearer <token>
7. Middleware authMiddleware:
   - Valida JWT
   - Extrae roles/permisos del token (sin consulta a DB)
   - Inyecta en req.user
8. Middleware authorize:
   - Verifica permisos desde req.user
   - Admin bypass automático
   - 403 si falta permiso
```

## ⚡ Optimizaciones

✅ **Roles y permisos en JWT** - No consulta DB en cada request
✅ **Admin bypass automático** - Admin no necesita permisos específicos
✅ **Middleware reutilizable** - Aplica a todas las rutas
✅ **Errores claros** - Diferencia 401 (sin token) vs 403 (sin permiso)
✅ **Escalable** - Fácil agregar nuevos permisos

## 📝 Checklist de Implementación

- [ ] Seeds ejecutados (roles y permisos creados en DB)
- [ ] `authMiddleware` actualizado en todas las rutas protegidas
- [ ] `authorize` middleware agregado a rutas sensibles
- [ ] JWT incluye roles y permisos en login
- [ ] express.d.ts actualizado (tipos de req.user)
- [ ] Ejemplos de rutas revisados
- [ ] Admin bypass funcionando (prueba con rol admin)
- [ ] Errores 401/403 diferenciados
- [ ] Tests de permisos

## 🧪 Testing Rápido

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Resultado:
# { user: {..., roles: ["manager"], permissions: [...]}, token: "..." }

# 2. Request protegido
curl -X GET http://localhost:3000/api/enterprises \
  -H "Authorization: Bearer <token>"

# 3. Sin permiso (debe 403)
# (mismo request pero con usuario sin permiso)
```

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si no tengo roles/permisos en BD?**
A: El usuario tiene array vacío de permisos. Cualquier `authorize()` returnará 403.

**P: ¿Admin puede acceder a todo?**
A: Sí, automáticamente. Si `isAdmin: true`, el middleware `authorize` hace bypass.

**P: ¿Puedo cambiar permisos sin reiniciar?**
A: No, están en el JWT. El usuario debe hacer logout/login para actualizar.

**P: ¿Cómo agrego nuevo permiso?**
A: 1. Agrega en `PERMISSIONS` constant, 2. Corre seed nuevamente, 3. Asigna a roles.

## 🐛 Troubleshooting

**Error: "Token inválido"**
- Verifica que el token incluya sub, email y es válido

**Error: "Acceso denegado" (403)**
- Verifica que el usuario tenga el permiso requerido
- Verifica que no sea admin (debug: log req.user.isAdmin)

**Los permisos no actualizan**
- Login nuevamente (el JWT se genera en login)
- Verifica que el seed asignó correctamente en role_permissions

**DB query lenta**
- Usa índices en user_roles y role_permissions
- Considera caché para getUser RolesAndPermissions()
