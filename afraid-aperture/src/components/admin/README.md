# Sistema de Diseño del Panel de Administración
## La Siberia Central - Modern Admin Dashboard

### 🎨 Concepto de Diseño

**Estética**: "Modern Culinary Dashboard" - Panel administrativo que combina la sofisticación de un restaurante premium con la funcionalidad de herramientas modernas.

**Paleta de Colores**:
- **Principal**: #d4534f (Rojo especiado) → #b33832 (Degradado)
- **Secundario**: #8b5a2b (Marrón cálido) → #6d4521 (Degradado)
- **Éxito**: #10b981 (Verde fresco)
- **Peligro**: #ef4444 (Rojo vibrante)
- **Neutros**: #1a1a1a (Negro), #f6f4ef (Beige suave)

**Tipografía**:
- **Display**: Playfair Display (Títulos elegantes, serif editorial)
- **UI**: Inter (Interfaz moderna, sans-serif limpia)

### 📦 Componentes Disponibles

#### 1. AdminCard
Contenedor principal para secciones del panel.

```astro
<AdminCard
  title="Título"
  subtitle="Subtítulo"
  variant="default|glass|elevated"
  fullHeight={true|false}
>
  Contenido aquí
</AdminCard>
```

**Variantes**:
- `default`: Card estándar con sombra suave
- `glass`: Efecto glassmorphism con blur
- `elevated`: Card elevado con sombra prominente y hover effect

#### 2. AdminButton
Botón con múltiples variantes y animaciones.

```astro
<AdminButton
  variant="primary|secondary|danger|ghost|success"
  size="small|medium|large"
  type="button|submit"
  fullWidth={true|false}
>
  Texto del botón
</AdminButton>
```

**Características**:
- Gradientes animados
- Efecto ripple al hacer clic
- Sombras dinámicas
- Iconos opcionales

#### 3. AdminInput
Campo de entrada unificado con soporte para múltiples tipos.

```astro
<AdminInput
  label="Etiqueta"
  name="campo"
  type="text|textarea|file|select|number|email"
  required={true|false}
  helper="Texto de ayuda"
  placeholder="Placeholder"
/>
```

**Tipos soportados**:
- Text, Email, Tel, Number
- Textarea (auto-resize)
- File (con preview visual)
- Select (dropdown estilizado)

#### 4. AdminModal
Modal overlay con animaciones suaves.

```astro
<AdminModal
  id="modal-id"
  title="Título del Modal"
  size="small|medium|large|fullscreen"
>
  Contenido del modal
</AdminModal>
```

**Funciones JavaScript**:
```javascript
openModal('modal-id')
closeModal('modal-id')
```

#### 5. AdminBadge
Etiquetas pequeñas para estados.

```astro
<AdminBadge
  variant="primary|success|warning|danger|info"
  size="small|medium"
  pulse={true|false}
>
  Texto
</AdminBadge>
```

#### 6. AddressSearch
Búsqueda de direcciones con integración de OpenStreetMap.

```astro
<AddressSearch
  latitudeInputName="latitude"
  longitudeInputName="longitude"
  initialLat={25.6866}
  initialLng={-100.3161}
/>
```

**Características**:
- Búsqueda en tiempo real con Nominatim API
- Mapa interactivo con Leaflet
- Marcador arrastrable
- Actualización automática de coordenadas

#### 7. PDFViewer
Visualizador de documentos PDF.

```astro
<PDFViewer
  pdfUrl="/path/to/menu.pdf"
  title="Menú de la Sucursal"
/>
```

#### 8. BranchesTab
Tab completo para gestión de sucursales (ejemplo de componente de tab).

```astro
<BranchesTab branches={branchesArray} />
```

### 🚀 Uso en el Panel Principal

```astro
---
import AdminCard from '../components/admin/AdminCard.astro';
import AdminButton from '../components/admin/AdminButton.astro';
import AdminInput from '../components/admin/AdminInput.astro';
import AdminModal from '../components/admin/AdminModal.astro';
import BranchesTab from '../components/admin/BranchesTab.astro';

// ... cargar datos
---

<Layout title="Panel Admin">
  <div class="admin-container">
    <!-- Navigation Tabs -->
    <nav class="admin-tabs">
      <a href="?tab=branches" class={tab === 'branches' ? 'active' : ''}>
        Sucursales
        <AdminBadge variant="primary">3</AdminBadge>
      </a>
      <!-- Más tabs... -->
    </nav>

    <!-- Tab Content -->
    {tab === 'branches' && <BranchesTab branches={branches} />}
    {tab === 'menus' && <MenusTab menus={menus} />}
    <!-- Más tabs... -->
  </div>
</Layout>
```

### 🎯 Funcionalidades Implementadas

#### Upload de PDFs de Menús
1. Endpoint: `/api/admin/menus/upload-pdf`
2. Acepta: PDF hasta 10MB
3. Almacena: Cloudflare R2 en `uploads/menus/`
4. Actualiza: Campo `pdf_url` en tabla `menus`

#### Búsqueda de Direcciones
- Integración con OpenStreetMap Nominatim API
- Mapa interactivo con Leaflet.js
- Geocodificación automática
- Almacena lat/lng en formulario

#### Visualización de Sucursales
- Cards animadas con hover effects
- Información completa (dirección, teléfonos, GPS)
- Badges de estado (activa/inactiva)
- Acciones rápidas (editar, eliminar)

### 📱 Responsive Design

Todos los componentes son completamente responsivos:
- Desktop: Grid de 2 columnas
- Tablet: Grid de 1 columna con ajustes
- Mobile: Stack vertical optimizado

### ⚡ Animaciones

Todas las animaciones usan `cubic-bezier` para movimientos naturales:
- **Entrada**: `fadeInUp` en cards
- **Hover**: `translateY(-2px)` con sombras dinámicas
- **Modals**: `slideUp` con backdrop blur
- **Badges pulse**: animación continua opcional

### 🔧 Próximos Pasos

Para completar el rediseño del panel:

1. **Crear tabs restantes**:
   - `MenusTab.astro` - Con upload de PDF y visualización
   - `ResumesTab.astro` - Lista de CVs con descarga
   - `MessagesTab.astro` - Mensajes de contacto
   - `ContentTab.astro` - Editor de contenido estático

2. **Actualizar panel principal** (`paneladministrador.astro`):
   - Reemplazar estilos antiguos
   - Integrar nuevos componentes
   - Añadir animaciones de transición entre tabs

3. **Mejoras adicionales**:
   - Dark mode toggle
   - Exportar datos a CSV/Excel
   - Dashboard con estadísticas
   - Notificaciones en tiempo real

### 🎨 Variables CSS Globales (Recomendadas)

```css
:root {
  /* Colors */
  --color-primary: #d4534f;
  --color-primary-dark: #b33832;
  --color-secondary: #8b5a2b;
  --color-secondary-dark: #6d4521;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  /* Neutrals */
  --color-black: #1a1a1a;
  --color-gray-dark: #2a2a2a;
  --color-gray: #666666;
  --color-gray-light: #999999;
  --color-background: #f6f4ef;
  --color-white: #ffffff;

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-ui: 'Inter', -apple-system, sans-serif;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 20px;
  --space-lg: 32px;
  --space-xl: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
}
```

### 📚 Recursos

- **Leaflet.js**: https://leafletjs.com/
- **OpenStreetMap Nominatim**: https://nominatim.org/
- **Playfair Display**: Google Fonts
- **Inter**: Google Fonts

---

**Diseñado con ❤️ para La Siberia Central**
