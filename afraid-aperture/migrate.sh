#!/bin/bash

# Script de Migración para D1 - Bash
# Uso: ./migrate.sh [comando]

DATABASE_NAME="siberia_prod"
MIGRATION_FILE="migrations/0001_add_menu_categories_and_items.sql"
ROLLBACK_FILE="migrations/0001_add_menu_categories_and_items_rollback.sql"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    cat << EOF

🗄️  Sistema de Migraciones D1 - La Siberia Central
================================================

Comandos disponibles:

  migrate       Aplicar migración (agrega tablas de categorías y productos)
  rollback      Revertir migración (PELIGRO: elimina datos)
  backup        Crear backup de la base de datos
  tables        Listar todas las tablas
  verify        Verificar que las nuevas tablas existan
  help          Mostrar esta ayuda

Ejemplos:
  ./migrate.sh migrate
  ./migrate.sh backup
  ./migrate.sh verify

EOF
}

do_migrate() {
    echo -e "${CYAN}🚀 Aplicando migración a $DATABASE_NAME...${NC}"
    npx wrangler d1 execute "$DATABASE_NAME" --file="$MIGRATION_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migración aplicada exitosamente${NC}"
        echo ""
        echo -e "${YELLOW}Ejecuta './migrate.sh verify' para verificar${NC}"
    else
        echo -e "${RED}❌ Error al aplicar migración${NC}"
    fi
}

do_rollback() {
    echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODAS las categorías y productos${NC}"
    read -p "¿Estás seguro? Escribe 'CONFIRMAR' para continuar: " confirm

    if [ "$confirm" = "CONFIRMAR" ]; then
        echo -e "${YELLOW}🔄 Revirtiendo migración...${NC}"
        npx wrangler d1 execute "$DATABASE_NAME" --file="$ROLLBACK_FILE"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Rollback completado${NC}"
        else
            echo -e "${RED}❌ Error en rollback${NC}"
        fi
    else
        echo -e "${YELLOW}❌ Rollback cancelado${NC}"
    fi
}

do_backup() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"

    echo -e "${CYAN}💾 Creando backup: $backup_file...${NC}"
    npx wrangler d1 export "$DATABASE_NAME" --output="$backup_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup creado: $backup_file${NC}"
    else
        echo -e "${RED}❌ Error al crear backup${NC}"
    fi
}

show_tables() {
    echo -e "${CYAN}📋 Listando tablas en $DATABASE_NAME...${NC}"
    npx wrangler d1 execute "$DATABASE_NAME" --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
}

verify_migration() {
    echo -e "${CYAN}🔍 Verificando migración...${NC}"
    echo ""

    echo -e "${YELLOW}Buscando tablas nuevas:${NC}"
    npx wrangler d1 execute "$DATABASE_NAME" --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('menu_categories', 'menu_items');"

    echo ""
    echo -e "${YELLOW}Verificando índices:${NC}"
    npx wrangler d1 execute "$DATABASE_NAME" --command="SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_menu%';"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Verificación completada${NC}"
    fi
}

# Main
case "${1:-help}" in
    migrate)
        do_migrate
        ;;
    rollback)
        do_rollback
        ;;
    backup)
        do_backup
        ;;
    tables)
        show_tables
        ;;
    verify)
        verify_migration
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando desconocido: $1${NC}"
        echo ""
        show_help
        ;;
esac
