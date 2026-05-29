-- Migration: 006_mitra_is_verified
-- Description: Add is_verified, ktp_pemilik, and nib columns to mitra table

ALTER TABLE mitra
  ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN ktp_pemilik VARCHAR(16),  -- Max 16 characters for numeric KTP
  ADD COLUMN nib TEXT;                  -- NIB free text

CREATE INDEX idx_mitra_verified ON mitra(is_verified);
