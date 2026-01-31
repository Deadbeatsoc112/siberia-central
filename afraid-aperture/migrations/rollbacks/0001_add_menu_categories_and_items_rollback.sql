-- Rollback Migration: Add menu categories and items tables
-- Date: 2026-01-30
-- WARNING: This will DELETE all categories and items data!

-- Drop indexes first
DROP INDEX IF EXISTS idx_menu_items_available;
DROP INDEX IF EXISTS idx_menu_items_category;
DROP INDEX IF EXISTS idx_menu_categories_menu;

-- Drop tables (cascades will handle foreign keys)
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS menu_categories;
