# Migraciones de Base de Datos D1

Este directorio contiene las migraciones para la base de datos D1 de Cloudflare.

## Aplicar Migraciones en Producción

### Método 1: Usando Wrangler CLI (Recomendado)

```bash
# Aplicar la migración específica
npx wrangler d1 execute siberia_prod --file=migrations/0001_add_menu_categories_and_items.sql

# O aplicar todas las migraciones pendientes
npx wrangler d1 migrations apply siberia_prod
```

### Método 2: Desde el Dashboard de Cloudflare

1. Ve a https://dash.cloudflare.com
2. Selecciona tu cuenta y proyecto
3. Ve a **Workers & Pages** > **D1** > **siberia_prod**
4. Haz clic en **Console**
5. Copia el contenido de `0001_add_menu_categories_and_items.sql`
6. Pégalo en la consola y ejecuta

### Método 3: Usando wrangler.toml (Migraciones Automáticas)

Si quieres usar el sistema de migraciones automáticas de Wrangler:

1. Crea las migraciones con:
   ```bash
   npx wrangler d1 migrations create siberia_prod add_menu_categories_and_items
   ```

2. Esto creará un archivo en `migrations/` que puedes editar

3. Aplica con:
   ```bash
   npx wrangler d1 migrations apply siberia_prod
   ```

## Verificar el Estado

```bash
# Ver el estado de las migraciones
npx wrangler d1 migrations list siberia_prod

# Verificar las tablas existentes
npx wrangler d1 execute siberia_prod --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## Rollback (PELIGRO: Borra datos)

Si necesitas revertir la migración:

```bash
npx wrangler d1 execute siberia_prod --file=migrations/0001_add_menu_categories_and_items_rollback.sql
```

**ADVERTENCIA:** Esto eliminará todas las categorías y productos. Haz backup primero.

## Orden de Migraciones

1. `0001_add_menu_categories_and_items.sql` - Agrega tablas de categorías y productos

## Notas Importantes

- **SQLite no soporta ALTER COLUMN:** No podemos modificar `pdf_url` de `NOT NULL` a nullable directamente en producción si ya existen datos. La nueva tabla se creará correctamente desde `schema.sql` en ambientes nuevos.

- **Estrategia para pdf_url opcional:**
  - Si hay menús existentes sin PDF, inserta cadena vacía `''` temporalmente
  - La aplicación ya maneja `pdf_url` como opcional (puede ser `null` o `''`)

## Backup Antes de Migrar

```bash
# Exportar datos existentes
npx wrangler d1 export siberia_prod --output=backup_$(date +%Y%m%d).sql
```

## Ejemplo de Uso Completo

```bash
# 1. Hacer backup
npx wrangler d1 export siberia_prod --output=backup_before_migration.sql

# 2. Aplicar migración
npx wrangler d1 execute siberia_prod --file=migrations/0001_add_menu_categories_and_items.sql

# 3. Verificar
npx wrangler d1 execute siberia_prod --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'menu_%';"

# 4. Verificar índices
npx wrangler d1 execute siberia_prod --command="SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_menu%';"
```
