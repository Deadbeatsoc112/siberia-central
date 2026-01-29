# Despliegue a Cloudflare Pages - La Siberia Central

## Resumen de Cambios Implementados

Este documento detalla todos los cambios realizados en el proyecto y el proceso completo para desplegarlo en Cloudflare Pages.

### Cambios Principales

#### 1. Sistema de Administración Completo

##### Nuevos Componentes Admin
- **PostsTab.astro**: Gestión completa del blog (crear, editar, eliminar, publicar)
- **JobsTab.astro**: Gestión de vacantes con campo de puestos disponibles
- **MenusTab.astro**: Gestión de menús con upload de PDFs
- **MessagesTab.astro**: Gestión de mensajes de contacto con estados y notas
- **ResumesTab.astro**: Gestión de hojas de vida con estados y descarga

##### Mejoras en Componentes Existentes
- **BranchesTab.astro**: Gestión mejorada de sucursales

#### 2. Base de Datos

##### Nuevas Tablas
- `contact_messages`: Mensajes de contacto del formulario público
- `resumes`: Hojas de vida recibidas
- `menus`: Menús por sucursal con PDFs

##### Migraciones
- Nuevo campo `available_positions` en tabla `jobs`
- Sistema de estados para mensajes y CVs

#### 3. APIs Implementadas

```
/api/admin/posts/
  ├── create        POST - Crear post
  ├── update        POST - Actualizar post
  └── delete        POST - Eliminar post

/api/admin/jobs/
  ├── create        POST - Crear vacante
  ├── update        POST - Actualizar vacante
  └── delete        POST - Eliminar vacante

/api/admin/menus/
  ├── create        POST - Crear menú
  ├── update        POST - Actualizar menú
  ├── delete        POST - Eliminar menú
  └── upload-pdf    POST - Subir PDF

/api/admin/messages/
  ├── update-status POST - Cambiar estado
  ├── add-note      POST - Añadir nota
  └── delete        POST - Eliminar mensaje

/api/admin/resumes/
  ├── update-status    POST - Cambiar estado
  ├── add-note         POST - Añadir nota
  ├── delete           POST - Eliminar CV
  └── download/[id]    GET  - Descargar CV

/api/admin/branches/
  ├── create        POST - Crear sucursal
  ├── update        POST - Actualizar sucursal
  └── delete        POST - Eliminar sucursal
```

#### 4. Rediseño de Bolsa de Trabajo

- **Diseño horizontal**: Tarjetas full-width en lugar de grid
- **Colores alternados**: Negro (#1a1a1a) y rojo (#e1454f)
- **Campo nuevo**: Muestra puestos disponibles
- **Responsive**: Optimizado para móviles
- **Animaciones**: Hover con desplazamiento y sombra

#### 5. Mejoras en Páginas Públicas

- **bolsa-de-trabajo.astro**: Rediseño completo
- **carta/[slug].astro**: Integración con sistema de menús
- **contacto.astro**: Integración con contact_messages
- **index.astro**: Actualizaciones de diseño
- **nosotros.astro**: Mejoras visuales

## Preparación para el Despliegue

### 1. Verificar Archivos Modificados

```bash
# Ver estado actual
git status

# Archivos modificados:
# - data/app.db-shm
# - data/app.db-wal
# - src/components/admin/BranchesTab.astro
# - src/layouts/Layout.astro
# - src/lib/content.ts
# - src/lib/db.ts
# - src/lib/menus.ts
# - src/pages/api/admin/jobs/create.ts
# - src/pages/api/admin/jobs/update.ts
# - src/pages/bolsa-de-trabajo.astro
# - src/pages/carta/[slug].astro
# - src/pages/contacto.astro
# - src/pages/index.astro
# - src/pages/nosotros.astro
# - src/pages/paneladministrador.astro

# Archivos nuevos:
# - CLAUDE.md
# - src/components/admin/JobsTab.astro
# - src/components/admin/MenusTab.astro
# - src/components/admin/MessagesTab.astro
# - src/components/admin/PostsTab.astro
# - src/components/admin/ResumesTab.astro
```

### 2. Configuración de Cloudflare

#### Archivo: `astro.config.mjs`

Verificar que esté configurado el adaptador de Cloudflare:

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    runtime: {
      mode: 'local',
      type: 'pages',
      bindings: {
        UPLOADS_BUCKET: {
          type: 'r2',
        },
        DB: {
          type: 'd1',
        }
      }
    }
  })
});
```

#### Dependencias Necesarias

```json
{
  "dependencies": {
    "astro": "^5.1.2",
    "@astrojs/cloudflare": "^12.0.0",
    "better-sqlite3": "^11.8.1",
    "wrangler": "latest"
  }
}
```

### 3. Configurar Variables de Entorno

#### Crear archivo `wrangler.toml` en la raíz del proyecto:

```toml
name = "la-siberia-central"
compatibility_date = "2024-01-01"

pages_build_output_dir = "./dist"

[env.production]
name = "la-siberia-central-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "siberia_prod"
database_id = "TU_DATABASE_ID_AQUI"

[[env.production.r2_buckets]]
binding = "UPLOADS_BUCKET"
bucket_name = "siberia-uploads"
```

#### Variables de Entorno en Cloudflare Dashboard

1. Ir a **Workers & Pages** → Tu proyecto → **Settings** → **Environment Variables**
2. Añadir las siguientes variables:

```
NODE_VERSION = 20
SESSION_SECRET = [genera_un_string_aleatorio_seguro]
```

## Proceso de Despliegue

### Opción 1: Despliegue Directo desde Git (Recomendado)

#### 1. Preparar el Repositorio

```bash
# Añadir archivos al staging
git add .

# Crear commit con todos los cambios
git commit -m "feat: sistema de administración completo

- Nuevo panel de administración con tabs
- Gestión de blog, vacantes, menús, mensajes y CVs
- Rediseño de página de bolsa de trabajo
- APIs CRUD completas para todos los recursos
- Sistema de estados para mensajes y CVs
- Upload de PDFs para menús
- Mejoras responsive en todas las páginas

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Subir a rama principal
git push origin Develop
```

#### 2. Configurar Cloudflare Pages

1. **Acceder a Cloudflare Dashboard**
   - Ir a https://dash.cloudflare.com/
   - Seleccionar tu cuenta
   - Ir a **Workers & Pages**

2. **Crear Nuevo Proyecto**
   - Click en **Create application**
   - Seleccionar **Pages**
   - Click en **Connect to Git**

3. **Conectar Repositorio**
   - Autorizar GitHub/GitLab
   - Seleccionar el repositorio `afraid-aperture`
   - Seleccionar rama: `Develop`

4. **Configurar Build Settings**
   ```
   Framework preset: Astro
   Build command: npm run build
   Build output directory: /dist
   Root directory: /
   Node version: 20
   ```

5. **Variables de Entorno**
   - Añadir `SESSION_SECRET` con valor aleatorio
   - Añadir `NODE_VERSION = 20`

6. **Guardar y Desplegar**
   - Click en **Save and Deploy**
   - Esperar a que termine el build

#### 3. Configurar D1 Database

```bash
# Instalar Wrangler globalmente
npm install -g wrangler

# Autenticar con Cloudflare
wrangler login

# Crear base de datos D1
wrangler d1 create siberia_prod

# Copiar el ID de la base de datos y actualizarlo en wrangler.toml
```

#### 4. Migrar Esquema de Base de Datos

Crear archivo `schema.sql` con el esquema completo:

```sql
-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  available_positions INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  phones TEXT DEFAULT '[]',
  contact_email TEXT,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Menus
CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  notes TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  position_applied TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_branches_slug ON branches(slug);
CREATE INDEX IF NOT EXISTS idx_menus_branch ON menus(branch_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
```

Ejecutar migración:

```bash
# Ejecutar el esquema en D1
wrangler d1 execute siberia_prod --file=schema.sql --remote

# Verificar tablas creadas
wrangler d1 execute siberia_prod --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

#### 5. Crear Usuario Admin

```bash
# Crear un script temporal para generar el hash de contraseña
# O ejecutar directamente en D1:
wrangler d1 execute siberia_prod --remote

# En el prompt de D1, insertar usuario:
INSERT INTO users (username, password_hash)
VALUES ('admin', 'tu_hash_generado_aqui');
```

> **Nota**: Para generar el hash de contraseña, usa el método PBKDF2 como en `src/lib/auth.ts`

#### 6. Configurar R2 Bucket para Uploads

```bash
# Crear bucket de R2
wrangler r2 bucket create siberia-uploads

# Vincular en wrangler.toml (ya incluido arriba)
```

#### 7. Vincular Servicios en Cloudflare Pages

1. En el dashboard de tu proyecto en Cloudflare Pages
2. Ir a **Settings** → **Functions**
3. En **D1 database bindings**, añadir:
   - Variable name: `DB`
   - D1 database: `siberia_prod`
4. En **R2 bucket bindings**, añadir:
   - Variable name: `UPLOADS_BUCKET`
   - R2 bucket: `siberia-uploads`

#### 8. Redesplegar

```bash
# Push para trigger nuevo despliegue
git commit --allow-empty -m "chore: trigger redeploy with bindings"
git push origin Develop
```

### Opción 2: Despliegue Manual con Wrangler

```bash
# Build del proyecto
npm run build

# Desplegar con Wrangler
wrangler pages deploy ./dist --project-name=la-siberia-central
```

## Post-Despliegue

### 1. Verificar Funcionalidades

- [ ] Página principal carga correctamente
- [ ] Página de vacantes muestra los jobs con colores alternados
- [ ] Formulario de contacto envía mensajes
- [ ] Panel de administración (/paneladministrador) carga
- [ ] Login funciona con credenciales admin
- [ ] Crear/editar/eliminar posts funciona
- [ ] Crear/editar/eliminar vacantes funciona
- [ ] Upload de PDFs de menús funciona
- [ ] Gestión de mensajes funciona
- [ ] Gestión de CVs funciona

### 2. Configurar Dominio Custom (Opcional)

1. Ir a **Custom domains** en tu proyecto
2. Click en **Set up a custom domain**
3. Ingresar tu dominio (ej: `lasiberiacentral.com`)
4. Seguir instrucciones para configurar DNS
5. Esperar a que se active el certificado SSL

### 3. Configurar Headers de Seguridad

En Cloudflare Pages, ir a **Settings** → **Functions** → **_headers**:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/admin/*
  X-Robots-Tag: noindex
```

### 4. Monitoreo y Logs

1. **Analytics**: Ver en Cloudflare Pages → Analytics
2. **Logs en tiempo real**:
   ```bash
   wrangler pages deployment tail
   ```
3. **Errores**: Revisar en Workers → Logs

## Troubleshooting

### Error: "Module not found: better-sqlite3"

**Solución**: En Cloudflare Pages, SQLite local no funciona. Debes usar D1:

```typescript
// src/lib/db.ts
export function getDb(env: any) {
  // En desarrollo, usar SQLite local
  if (import.meta.env.DEV) {
    return Database('./data/app.db');
  }
  // En producción, usar D1
  return env.DB;
}
```

### Error: "Session not found"

**Solución**: Verificar que `SESSION_SECRET` esté configurado en variables de entorno de Cloudflare.

### Error: "Cannot upload file"

**Solución**: Verificar que el R2 bucket esté vinculado correctamente:

```bash
# Listar bindings
wrangler pages deployment list --project-name=la-siberia-central
```

### Error: "Database locked"

**Solución**: En D1, esto no debería ocurrir. Si pasa, revisar que no haya transacciones abiertas sin cerrar.

### Build falla con error de memoria

**Solución**: Aumentar límite de memoria en build:

```toml
# wrangler.toml
[build]
command = "NODE_OPTIONS='--max-old-space-size=4096' npm run build"
```

## Mantenimiento

### Actualizar el Sitio

```bash
# Hacer cambios en el código
git add .
git commit -m "descripción de cambios"
git push origin Develop

# Cloudflare desplegará automáticamente
```

### Backups de Base de Datos

```bash
# Exportar D1 database
wrangler d1 export siberia_prod --output=backup.sql --remote

# Restaurar desde backup
wrangler d1 execute siberia_prod --file=backup.sql --remote
```

### Ver Logs de Producción

```bash
# Logs en tiempo real
wrangler pages deployment tail --project-name=la-siberia-central

# Logs de una función específica
wrangler pages deployment tail --project-name=la-siberia-central --filter="/api/admin/*"
```

### Rollback a Versión Anterior

1. En Cloudflare Dashboard → Pages → Tu proyecto
2. Ir a **Deployments**
3. Encontrar el deployment anterior que funcionaba
4. Click en los tres puntos → **Rollback to this deployment**

## Checklist Final de Despliegue

- [ ] Código commiteado y pusheado a GitHub
- [ ] Proyecto configurado en Cloudflare Pages
- [ ] Variables de entorno configuradas
- [ ] D1 database creada y migrada
- [ ] R2 bucket creado
- [ ] Bindings vinculados al proyecto
- [ ] Usuario admin creado en la base de datos
- [ ] Build completado exitosamente
- [ ] Sitio accesible en URL de Cloudflare
- [ ] Panel de administración funcional
- [ ] Funcionalidades verificadas
- [ ] Headers de seguridad configurados
- [ ] Dominio custom configurado (opcional)
- [ ] Monitoreo activado

## Recursos Útiles

- [Documentación de Astro Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## Contacto de Soporte

Para problemas con el despliegue:
1. Revisar logs de Cloudflare
2. Consultar este documento
3. Revisar CLAUDE.md para detalles del proyecto
4. Abrir ticket en Cloudflare Support (si es problema de infraestructura)

---

**Generado**: 2026-01-29
**Versión**: 1.0.0
**Proyecto**: La Siberia Central
**Deploy Target**: Cloudflare Pages + D1 + R2
