# Script de Migración para D1 - Windows PowerShell
# Uso: .\migrate.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "migrate"
)

$DatabaseName = "siberia_prod"
$MigrationFile = "migrations/0001_add_menu_categories_and_items.sql"
$RollbackFile = "migrations/0001_add_menu_categories_and_items_rollback.sql"

function Show-Help {
    Write-Host @"

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
  .\migrate.ps1 migrate
  .\migrate.ps1 backup
  .\migrate.ps1 verify

"@
}

function Invoke-Migrate {
    Write-Host "🚀 Aplicando migración a $DatabaseName..." -ForegroundColor Cyan
    npx wrangler d1 execute $DatabaseName --file=$MigrationFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración aplicada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ejecuta '.\migrate.ps1 verify' para verificar" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al aplicar migración" -ForegroundColor Red
    }
}

function Invoke-Rollback {
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODAS las categorías y productos" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? Escribe 'CONFIRMAR' para continuar"

    if ($confirm -eq "CONFIRMAR") {
        Write-Host "🔄 Revirtiendo migración..." -ForegroundColor Yellow
        npx wrangler d1 execute $DatabaseName --file=$RollbackFile

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Rollback completado" -ForegroundColor Green
        } else {
            Write-Host "❌ Error en rollback" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Rollback cancelado" -ForegroundColor Yellow
    }
}

function Invoke-Backup {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"

    Write-Host "💾 Creando backup: $backupFile..." -ForegroundColor Cyan
    npx wrangler d1 export $DatabaseName --output=$backupFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup creado: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al crear backup" -ForegroundColor Red
    }
}

function Show-Tables {
    Write-Host "📋 Listando tablas en $DatabaseName..." -ForegroundColor Cyan
    npx wrangler d1 execute $DatabaseName --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
}

function Verify-Migration {
    Write-Host "🔍 Verificando migración..." -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Buscando tablas nuevas:" -ForegroundColor Yellow
    npx wrangler d1 execute $DatabaseName --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('menu_categories', 'menu_items');"

    Write-Host ""
    Write-Host "Verificando índices:" -ForegroundColor Yellow
    npx wrangler d1 execute $DatabaseName --command="SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_menu%';"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Verificación completada" -ForegroundColor Green
    }
}

# Main
switch ($Command.ToLower()) {
    "migrate" { Invoke-Migrate }
    "rollback" { Invoke-Rollback }
    "backup" { Invoke-Backup }
    "tables" { Show-Tables }
    "verify" { Verify-Migration }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando desconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
