# Instrucciones de Migración - Panel Admin Moderno

## 🎨 Nuevo Sistema de Diseño

Se ha implementado un sistema de diseño moderno y componentes reutilizables para el panel de administración.

## ⚠️ Importante: Migración de Base de Datos

La tabla `menus` ahora requiere una columna adicional `pdf_url`. Si ya tienes datos en tu base de datos:

### Opción 1: Recrear la base de datos (Desarrollo)

```bash
# Elimina la base de datos actual
rm data/app.db data/app.db-shm data/app.db-wal

# Reconstruye el proyecto (esto creará las tablas nuevas)
npm run build
```

### Opción 2: Migración Manual (Producción)

Si tienes datos importantes, ejecuta este SQL:

```sql
ALTER TABLE menus ADD COLUMN pdf_url TEXT;
```

## 🚀 Pasos para Usar el Nuevo Panel

### 1. Compilar el Proyecto

```bash
npm run build
```

Esto ejecutará las migraciones y creará las nuevas tablas.

### 2. Iniciar en Desarrollo

```bash
npm run dev
```

### 3. Acceder al Panel

Visita: http://localhost:4321/paneladministrador

Credenciales:
- Usuario: `admin`
- Contraseña: `admin`

## 🎯 Nuevas Funcionalidades

### Gestión de Sucursales Mejorada

**Búsqueda de direcciones con OpenStreetMap:**
1. Escribe la dirección en el campo de búsqueda
2. Selecciona el resultado correcto
3. El mapa se centrará y las coordenadas se actualizarán automáticamente
4. Puedes arrastrar el marcador para ajustar la ubicación

**Visualización:**
- Cards elegantes con información completa
- Badges de estado (activa/inactiva)
- Hover effects animados
- Acciones rápidas (editar/eliminar)

### Upload de PDFs de Menús

**Próximamente** - Endpoint configurado en `/api/admin/menus/upload-pdf`

Para subir PDFs de menús:
1. Crear un menú para una sucursal
2. Subir el PDF (máximo 10MB)
3. El PDF se almacenará en Cloudflare R2
4. Se podrá visualizar en un modal en el frontend

### Modal para Visualizar Menús

Usa el componente `AdminModal` y `PDFViewer`:

```astro
<AdminModal id="menu-modal" title="Menú de la Sucursal" size="large">
  <PDFViewer pdfUrl="/api/media/uploads/menus/menu-123.pdf" />
</AdminModal>

<button onclick="openModal('menu-modal')">Ver Menú</button>
```

## 📦 Componentes Creados

Todos disponibles en `src/components/admin/`:

1. **AdminCard** - Contenedor principal con variantes
2. **AdminButton** - Botones animados con gradientes
3. **AdminInput** - Campos de entrada unificados
4. **AdminModal** - Modals con animaciones
5. **AdminBadge** - Etiquetas de estado
6. **AddressSearch** - Búsqueda de direcciones con mapa
7. **PDFViewer** - Visualizador de PDFs
8. **BranchesTab** - Tab completo de sucursales

## 🎨 Tipografía

Se agregaron dos fuentes de Google Fonts:

- **Playfair Display**: Títulos elegantes (serif editorial)
- **Inter**: UI moderna (sans-serif)

Ya están cargadas en el `Layout.astro`.

## 🔧 Configuración de Cloudflare R2

Para que funcione el upload de PDFs y CVs:

### 1. Crear el Bucket

```bash
npx wrangler r2 bucket create siberia-uploads
```

### 2. Verificar wrangler.jsonc

Ya está configurado en el archivo, verifica:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "UPLOADS_BUCKET",
      "bucket_name": "siberia-uploads"
    }
  ]
}
```

### 3. Deploy a Cloudflare

```bash
npm run build
npx wrangler pages deploy dist
```

## 📱 Responsive

Todos los componentes son completamente responsivos:
- **Desktop**: Grid de 2 columnas
- **Tablet**: Ajustes en grid
- **Mobile**: Stack vertical

## ⚡ Animaciones

Todas las animaciones usan transiciones suaves:
- Fade in al cargar
- Hover effects con elevación
- Modals con slide up
- Badges con pulse opcional

## 🎯 Próximos Pasos Recomendados

### 1. Completar Tabs Restantes

Crear componentes similares a `BranchesTab.astro` para:
- Menús (con upload de PDF)
- CVs (con descarga)
- Mensajes
- Contenido estático

### 2. Actualizar Panel Principal

Reemplazar el contenido de `paneladministrador.astro` con los nuevos componentes:

```astro
---
import BranchesTab from '../components/admin/BranchesTab.astro';
import MenusTab from '../components/admin/MenusTab.astro';
// ... más tabs
---

<div class="modern-admin">
  <nav class="admin-tabs-modern">
    <!-- Tabs modernos -->
  </nav>

  <div class="admin-content">
    {tab === 'branches' && <BranchesTab branches={branches} />}
    {tab === 'menus' && <MenusTab menus={menus} />}
    <!-- Más tabs -->
  </div>
</div>
```

### 3. Dashboard con Estadísticas

Crear un tab "Dashboard" con:
- Gráficas de CVs recibidos
- Mensajes por fecha
- Sucursales más populares
- Resumen de vacantes

### 4. Dark Mode

Implementar toggle de tema oscuro usando CSS variables.

## 🐛 Troubleshooting

### Error: "Cannot find module 'leaflet'"

```bash
npm install leaflet
npm install -D @types/leaflet
```

### Error: "UPLOADS_BUCKET is undefined"

Asegúrate de:
1. Haber creado el bucket en Cloudflare R2
2. El binding esté en `wrangler.jsonc`
3. Estés ejecutando con `wrangler pages dev` en desarrollo

### Estilos no se aplican

Asegúrate de que las fuentes de Google estén cargadas en `Layout.astro`.

## 📞 Soporte

Para más información sobre los componentes, revisa:
`src/components/admin/README.md`

---

**¡Disfruta del nuevo panel moderno!** 🎉
