-- Migration: Add branch_id to contact_messages
-- Date: 2026-02-23
-- Description: Associate contact messages with a specific branch

ALTER TABLE contact_messages ADD COLUMN branch_id INTEGER REFERENCES branches(id);