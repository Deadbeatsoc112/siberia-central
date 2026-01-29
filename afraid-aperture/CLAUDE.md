# La Siberia Central - Panel de Administración

## Descripción del Proyecto

**La Siberia Central** es un sistema web completo para una cadena de restaurantes de comida regional del norte de México. El proyecto incluye un sitio web público y un panel de administración completo para gestionar contenido, vacantes, menús, mensajes y hojas de vida.

## Stack Tecnológico

- **Framework**: Astro 5.1.2
- **Base de datos**: SQLite con better-sqlite3
- **Autenticación**: Sistema custom con sesiones basadas en cookies
- **Estilos**: CSS vanilla con diseño responsive
- **Tipografía**: Playfair Display (títulos), Inter (UI), Campton (contenido)
- **Deploy**: Cloudflare Pages (según configuración)

## Estructura del Proyecto

```
src/
├── pages/
│   ├── paneladministrador.astro        # Panel de administración principal
│   ├── bolsa-de-trabajo.astro          # Página pública de vacantes
│   ├── carta.astro                     # Página de menús por sucursal
│   ├── blog/                           # Blog público
│   └── api/                            # Endpoints API
│       └── admin/                      # APIs protegidas
│           ├── posts/                  # CRUD de blog
│           ├── jobs/                   # CRUD de vacantes
│           ├── menus/                  # CRUD de menús
│           ├── messages/               # Gestión de mensajes
│           ├── resumes/                # Gestión de CVs
│           └── branches/               # CRUD de sucursales
├── components/
│   └── admin/                          # Componentes del panel
│       ├── PostsTab.astro              # Gestión de blog
│       ├── JobsTab.astro               # Gestión de vacantes
│       ├── MenusTab.astro              # Gestión de menús
│       ├── MessagesTab.astro           # Gestión de mensajes
│       ├── ResumesTab.astro            # Gestión de CVs
│       ├── BranchesTab.astro           # Gestión de sucursales
│       ├── AdminCard.astro             # Card contenedor
│       ├── AdminButton.astro           # Botón estilizado
│       ├── AdminInput.astro            # Input unificado
│       ├── AdminBadge.astro            # Badge de estado
│       ├── AdminModal.astro            # Modal overlay
│       └── PDFViewer.astro             # Visor de PDF
├── lib/
│   ├── db.ts                           # Configuración de base de datos
│   ├── auth.ts                         # Sistema de autenticación
│   ├── content.ts                      # Repos de posts y jobs
│   ├── branches.ts                     # Repo de sucursales
│   ├── menus.ts                        # Repo de menús
│   ├── resumes.ts                      # Repo de hojas de vida
│   └── contactMessages.ts              # Repo de mensajes
└── layouts/
    └── Layout.astro                    # Layout principal
```

## Base de Datos

### Tablas Principales

#### posts (Blog)
- `id`, `title`, `slug`, `excerpt`, `content`
- `image_url`, `published` (0/1)
- `created_at`, `updated_at`

#### jobs (Vacantes)
- `id`, `title`, `location`, `type`, `description`
- `is_active` (0/1), `available_positions` (nuevo campo)
- `created_at`, `updated_at`

#### menus (Menús)
- `id`, `branch_id` (FK), `name`, `pdf_url`
- `display_order`, `is_active` (0/1)
- `created_at`, `updated_at`

#### resumes (Hojas de Vida)
- `id`, `job_id` (FK), `full_name`, `email`, `phone`
- `file_path`, `file_name`, `file_size`
- `position_applied`, `status` (pending/read/rejected/approved)
- `notes`, `created_at`, `updated_at`

#### contact_messages (Mensajes de Contacto)
- `id`, `full_name`, `email`, `phone`, `message`
- `status` (unread/read/responded/closed)
- `notes`, `ip_address`
- `created_at`, `updated_at`

#### branches (Sucursales)
- `id`, `name`, `slug`, `address`
- `latitude`, `longitude`, `phones` (JSON array)
- `contact_email`, `is_active` (0/1)
- `display_order`, `created_at`, `updated_at`

## Características Implementadas

### Panel de Administración

#### 1. Blog (PostsTab)
- **Crear** posts con título, resumen, contenido e imagen
- **Editar** posts existentes mediante modal
- **Eliminar** posts con confirmación
- **Publicar/Despublicar** (toggle published)
- Auto-generación de slugs únicos
- Preview de excerpt en lista

#### 2. Vacantes (JobsTab)
- **Crear** vacantes con ubicación, tipo, descripción
- **Campo nuevo**: `available_positions` (número de puestos disponibles)
- **Editar** vacantes mediante modal
- **Eliminar** vacantes con confirmación
- **Preview de color**: Muestra el color que tendrá en la página pública
- **Colores automáticos**: Negro (#1a1a1a) y rojo (#e1454f) alternados según índice

#### 3. Menús (MenusTab)
- **Crear** menús asociados a sucursales
- **Upload de PDF**: Subir archivo PDF del menú
- **Ver PDF**: Visualizador inline del menú
- **Editar** menús mediante modal
- **Eliminar** menús con confirmación
- Select dinámico de sucursales
- Orden de visualización personalizable

#### 4. Mensajes de Contacto (MessagesTab)
- **Vista expandible**: Accordion para cada mensaje
- **Cambiar estado**: unread → read → responded → closed
- **Añadir notas internas**: Comentarios del administrador
- **Eliminar** mensajes con confirmación
- Ordenados por fecha (más recientes primero)
- Badge de estado con colores distintivos

#### 5. Hojas de Vida (ResumesTab)
- **Vista expandible**: Accordion para cada CV
- **Cambiar estado**: pending → read → rejected → approved
- **Añadir notas internas**: Evaluación del candidato
- **Descargar CV**: Link directo al archivo PDF/Word
- **Eliminar** CV con confirmación
- Ordenados por fecha (más recientes primero)
- Muestra información del archivo (nombre, tamaño)

#### 6. Sucursales (BranchesTab) - Ya existente
- CRUD completo de sucursales
- Búsqueda de ubicación con mapa Leaflet
- Múltiples teléfonos por sucursal
- Orden de visualización

### Página Pública de Vacantes (bolsa-de-trabajo.astro)

#### Diseño Horizontal Nuevo
- **Tarjetas full-width** en lugar de grid de 3 columnas
- **Colores de fondo alternados**: Negro y rojo según índice
- **Contenido en blanco**: Título, ubicación, puestos disponibles
- **Icono de ubicación en rojo**: SVG con color #e1454f
- **Botón "Postúlate"**: Borde blanco, hover con fondo blanco
- **Efecto hover**: Desplazamiento a la derecha y sombra
- **Responsive**: En móvil se apila verticalmente

#### Estructura de Tarjeta
```
┌─────────────────────────────────────────────────────┐
│ [Título en Blanco]               [Botón Postúlate]  │
│ 📍 Ubicación                                        │
│ Puestos disponibles: X                              │
└─────────────────────────────────────────────────────┘
```

## Autenticación

### Sistema de Sesiones
- **Cookie**: `panel_session` (httpOnly, sameSite=lax)
- **TTL**: 8 horas
- **Método**: PBKDF2-SHA256 (120,000 iteraciones)
- **Credenciales default**: admin/admin

### Protección de Rutas
Todos los endpoints en `/api/admin/*` verifican autenticación:
```typescript
const user = auth.getUserFromCookies(cookies);
if (!user) {
  return Response.redirect('/paneladministrador', 303);
}
```

## Endpoints API

### Posts (Blog)
- `POST /api/admin/posts/create` - Crear post
- `POST /api/admin/posts/update` - Actualizar post (requiere `id`)
- `POST /api/admin/posts/delete` - Eliminar post (requiere `id`)

### Jobs (Vacantes)
- `POST /api/admin/jobs/create` - Crear vacante
- `POST /api/admin/jobs/update` - Actualizar vacante (requiere `id`)
- `POST /api/admin/jobs/delete` - Eliminar vacante (requiere `id`)

### Menus
- `POST /api/admin/menus/create` - Crear menú
- `POST /api/admin/menus/update` - Actualizar menú (requiere `id`)
- `POST /api/admin/menus/delete` - Eliminar menú (requiere `id`)
- `POST /api/admin/menus/upload-pdf` - Subir PDF (requiere `menu_id`, `pdf_file`)

### Messages (Mensajes)
- `POST /api/admin/messages/update-status` - Cambiar estado (requiere `id`, `status`)
- `POST /api/admin/messages/add-note` - Añadir nota (requiere `id`, `notes`)
- `POST /api/admin/messages/delete` - Eliminar mensaje (requiere `id`)

### Resumes (CVs)
- `GET /api/admin/resumes/download/[id]` - Descargar CV
- `POST /api/admin/resumes/update-status` - Cambiar estado (requiere `id`, `status`)
- `POST /api/admin/resumes/add-note` - Añadir nota (requiere `id`, `notes`)
- `POST /api/admin/resumes/delete` - Eliminar CV (requiere `id`)

### Branches (Sucursales)
- `POST /api/admin/branches/create` - Crear sucursal
- `POST /api/admin/branches/update` - Actualizar sucursal (requiere `id`)
- `POST /api/admin/branches/delete` - Eliminar sucursal (requiere `id`)

## Diseño y Estilos

### Paleta de Colores
- **Primary**: #d4534f (Rojo especiado)
- **Secondary**: #8b5a2b (Marrón cálido)
- **Success**: #10b981 (Verde fresco)
- **Danger**: #ef4444 (Rojo vibrante)
- **Warning**: #f59e0b (Naranja)
- **Info**: #3b82f6 (Azul)
- **Background**: #f6f4ef (Beige suave)

### Componentes Reutilizables

#### AdminCard
- Variantes: `default`, `glass`, `elevated`
- Props: `title`, `subtitle`, `variant`, `fullHeight`

#### AdminButton
- Variantes: `primary`, `secondary`, `danger`, `ghost`, `success`
- Tamaños: `small`, `medium`, `large`
- Props: `variant`, `size`, `type`, `disabled`, `fullWidth`

#### AdminInput
- Tipos: `text`, `textarea`, `file`, `select`, `email`, `number`
- Props: `label`, `name`, `type`, `value`, `required`, `helper`

#### AdminBadge
- Variantes: `primary`, `success`, `warning`, `danger`, `info`
- Tamaños: `small`, `medium`
- Props: `variant`, `size`, `pulse` (animación)

#### AdminModal
- Tamaños: `small`, `medium`, `large`, `fullscreen`
- Funciones globales: `openModal(id)`, `closeModal(id)`
- Props: `id`, `title`, `size`

## Patrón de Diseño

Todos los componentes Tab siguen una estructura consistente:

```astro
<div class="[tab-name]-tab">
  <div class="[tab-name]-tab__grid">
    <!-- Columna 1: Formulario de creación -->
    <AdminCard variant="elevated">
      <form action="/api/admin/[resource]/create" method="post">
        <AdminInput ... />
        <AdminButton type="submit">Crear</AdminButton>
      </form>
    </AdminCard>

    <!-- Columna 2: Lista de elementos -->
    <AdminCard variant="glass" fullHeight>
      {items.map(item => (
        <div class="item-card">
          <header>...</header>
          <details>...</details>
          <actions>
            <button onclick={`openModal('edit-${item.id}')`}>Editar</button>
            <form action="/api/admin/[resource]/delete">
              <button>Eliminar</button>
            </form>
          </actions>
        </div>
      ))}
    </AdminCard>
  </div>
</div>
```

## Flujo de Trabajo

### Crear Elemento
1. Usuario llena formulario en columna izquierda
2. Submit envía POST a `/api/admin/[resource]/create`
3. Endpoint valida datos y crea registro
4. Redirección a panel con mensaje de éxito
5. Elemento aparece en lista de columna derecha

### Editar Elemento
1. Usuario hace clic en "Editar"
2. Se abre modal con formulario pre-llenado
3. Usuario modifica datos y guarda
4. Submit envía POST a `/api/admin/[resource]/update`
5. Endpoint actualiza registro
6. Redirección cierra modal y actualiza vista

### Eliminar Elemento
1. Usuario hace clic en "Eliminar"
2. Confirmación con `confirm()`
3. Submit envía POST a `/api/admin/[resource]/delete`
4. Endpoint elimina registro
5. Redirección actualiza vista sin el elemento

## Responsive Design

### Breakpoints
- **Desktop**: > 1200px (grid de 2 columnas)
- **Tablet**: 768px - 1200px (grid de 1 columna)
- **Mobile**: < 768px (optimizaciones adicionales)

### Vacantes en Móvil
- Tarjetas apiladas verticalmente
- Botón "Postúlate" full-width
- Tamaño de fuente reducido
- Padding ajustado

## Mejoras Futuras (No Implementadas)

- Editor WYSIWYG para contenido de blog
- Galería de imágenes con upload
- Sistema de categorías para blog
- Filtros y búsqueda en listas
- Paginación para listas largas
- Dashboard con estadísticas
- Notificaciones en tiempo real
- Multi-idioma (i18n)
- Exportación de datos a CSV/Excel
- Sistema de permisos por rol

## Comandos Útiles

### Desarrollo
```bash
npm run dev         # Iniciar servidor de desarrollo
npm run build       # Build para producción
npm run preview     # Preview del build
```

### Base de Datos
La base de datos se inicializa automáticamente al iniciar el servidor.
- Ubicación: `data/app.db`
- Migración automática del campo `available_positions` en `jobs`
- Seed de usuario admin y sucursales de ejemplo

### Testing
Para probar el panel:
1. Iniciar servidor: `npm run dev`
2. Ir a: `http://localhost:4321/paneladministrador`
3. Login: admin / admin
4. Navegar por tabs para probar funcionalidades

## Notas de Implementación

### Colores Automáticos en Vacantes
Los colores de fondo se asignan mediante lógica en el template:
```astro
{jobs.map((job, index) => {
  const bgColor = index % 2 === 0 ? '#1a1a1a' : '#e1454f';
  // ...
})}
```

### Gestión de Estados
- **Posts**: `published` (0 = borrador, 1 = publicado)
- **Jobs**: `is_active` (0 = inactiva, 1 = activa)
- **Messages**: `unread` → `read` → `responded` → `closed`
- **Resumes**: `pending` → `read` → `rejected` / `approved`

### Upload de Archivos
- **CVs**: Cloudflare R2 bucket (UPLOADS_BUCKET)
- **PDFs de menú**: Endpoint `/api/admin/menus/upload-pdf`
- **Validación**: Tipos MIME, tamaño máximo 5MB

## Contacto y Soporte

Para dudas o mejoras del proyecto:
- Revisar este documento
- Consultar el código fuente con comentarios
- Verificar el plan de implementación en `.claude/plans/`

---

**Última actualización**: 2026-01-29
**Versión**: 1.0.0
**Desarrollado con**: Claude Code (Sonnet 4.5)
