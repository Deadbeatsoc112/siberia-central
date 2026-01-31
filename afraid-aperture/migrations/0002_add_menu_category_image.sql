-- Migration: Add image_url to menu_categories
-- Date: 2026-01-31
-- Description: Allow categories to store a representative image

ALTER TABLE menu_categories ADD COLUMN image_url TEXT;
