# Migración D1 - La Siberia Central

## Resumen de Cambios

Se ha completado la migración de `better-sqlite3` a Cloudflare D1. Todos los archivos han sido refactorizados para usar async/await con D1.

## Archivos Modificados

### Core (3 archivos)
- ✅ `src/env.d.ts` - Tipos de D1 y Astro.locals
- ✅ `src/lib/db.ts` - Helpers para D1 (getDB, dbGet, dbAll, dbRun)
- ✅ `src/lib/auth.ts` - Auth async con D1

### Repositorios (5 archivos)
- ✅ `src/lib/content.ts` - postsRepo, jobsRepo
- ✅ `src/lib/branches.ts` - branchesRepo
- ✅ `src/lib/menus.ts` - menusRepo, categoriesRepo, itemsRepo
- ✅ `src/lib/resumes.ts` - resumesRepo
- ✅ `src/lib/contactMessages.ts` - messagesRepo
- ✅ `src/lib/pageContent.ts` - pageContentRepo
- ✅ `src/lib/rateLimit.ts` - checkRateLimit async

### Páginas Astro (7 archivos)
- ✅ `src/pages/paneladministrador.astro`
- ✅ `src/pages/bolsa-de-trabajo.astro`
- ✅ `src/pages/blog/index.astro`
- ✅ `src/pages/blog/[slug].astro`
- ✅ `src/pages/carta/[slug].astro`
- ✅ `src/pages/nosotros.astro`
- ✅ `src/pages/contacto.astro`

### API Endpoints (27 archivos)
- ✅ Login/Logout (2)
- ✅ Posts CRUD (3)
- ✅ Jobs CRUD (3)
- ✅ Branches CRUD (3)
- ✅ Menus CRUD (4)
- ✅ Menu Categories CRUD (3)
- ✅ Menu Items CRUD (3)
- ✅ Messages (3)
- ✅ Resumes (4)
- ✅ Content (1)
- ✅ Contact Submit (1)

### Configuración
- ✅ `package.json` - Removido better-sqlite3, agregado @cloudflare/workers-types
- ✅ `wrangler.jsonc` - Ya configurado con D1 binding

## Comandos

### Desarrollo Local
```bash
npm run build
npx wrangler pages dev dist
```

### Deploy
```bash
npm run build
npx wrangler pages deploy dist
```

O via Git push a la rama configurada.

## Base de Datos

### Estado Actual
- ✅ D1 database `siberia_prod` creada (ID: `afe47647-58c3-49f9-8c3f-1925564407ac`)
- ✅ Schema aplicado desde `schema.sql`
- ✅ Binding configurado en `wrangler.jsonc`

### Seed Data (Opcional)
Si necesitas poblar la base de datos, ejecuta:

```bash
npx wrangler d1 execute siberia_prod --remote --file=./seed.sql
```

El archivo `seed.sql` contiene:
- Usuario admin (username: admin, password: admin)
- 2 sucursales de ejemplo (Central, San Pedro)
- Contenido de página inicial

## Cambios Técnicos Clave

### 1. Patrón de Acceso a DB
```typescript
// Antes
import { db } from './db';
const posts = postsRepo.listAll();

// Ahora
import { getDB } from './db';
const db = getDB(Astro.locals);
const posts = await postsRepo.listAll(db);
```

### 2. Timestamps
- `created_at` y `updated_at` ahora son `TEXT` (ISO strings)
- Uso de `CURRENT_TIMESTAMP` en SQL en lugar de epoch manual

### 3. Auth
- Todas las funciones de auth son async
- `password_hash` almacena `salt:hash` combinados (no salt separado)

### 4. Helpers
- `dbGet<T>()` - Retorna un registro o null
- `dbAll<T>()` - Retorna array de registros
- `dbRun()` - Ejecuta INSERT/UPDATE/DELETE

## Testing

### Checklist Manual
- [ ] Build exitoso (`npm run build`)
- [ ] Login funciona (`/paneladministrador`)
- [ ] Crear/editar/eliminar post
- [ ] Crear/editar/eliminar job
- [ ] Ver `/blog`
- [ ] Ver `/bolsa-de-trabajo`
- [ ] Crear sucursal con mapa
- [ ] Subir menú PDF
- [ ] Enviar mensaje de contacto
- [ ] Ver resúmenes de CVs

## Troubleshooting

### Error: "D1 binding not found"
Verifica que `wrangler.jsonc` tenga:
```jsonc
{
  "d1_databases": [
    {
      "binding": "siberia_prod",
      "database_name": "siberia_prod",
      "database_id": "afe47647-58c3-49f9-8c3f-1925564407ac"
    }
  ]
}
```

### Error: "Cannot read property of null"
Asegúrate de que todas las llamadas a repos pasen `db` como primer parámetro.

### Error en local dev
Usa `wrangler pages dev dist` en lugar de `npm run preview` para tener acceso a D1.

## Próximos Pasos

1. ✅ Migración completada
2. ⏸️ Testing local con `wrangler pages dev`
3. ⏸️ Deploy a staging/producción
4. ⏸️ Monitoreo de errores en producción

## Notas

- La base de datos SQLite local (`data/app.db`) ya no se usa
- Los archivos de seed y migraciones ya no son necesarios
- El proyecto ahora funciona 100% con Cloudflare D1
