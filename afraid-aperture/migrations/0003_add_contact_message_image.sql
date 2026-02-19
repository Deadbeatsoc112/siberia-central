-- Migration: Add image_path to contact_messages
-- Date: 2026-02-19
-- Description: Allow contact form submissions to include an optional image attachment

ALTER TABLE contact_messages ADD COLUMN image_path TEXT;
