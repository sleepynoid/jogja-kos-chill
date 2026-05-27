-- Migration: 004_admin_and_approval
-- Description: Add is_admin to users, is_approved to kos

-- ============================================================
-- ADD is_admin TO users
-- ============================================================

ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_users_admin ON users(is_admin) WHERE is_admin = TRUE;

-- ============================================================
-- ADD is_approved TO kos
-- NULL  = pending review
-- TRUE  = approved (tampil di katalog)
-- FALSE = rejected
-- ============================================================

ALTER TABLE kos ADD COLUMN is_approved BOOLEAN DEFAULT NULL;

CREATE INDEX idx_kos_approved ON kos(is_approved);

-- Auto-approve semua kos yang sudah ada sebelum migration ini
UPDATE kos SET is_approved = TRUE WHERE is_approved IS NULL;

-- ============================================================
-- SEED ADMIN (manual: ganti <bcrypt_hash> sebelum dijalankan)
-- Generate hash: node -e "const b=require('bcryptjs');b.hash('password',12).then(console.log)"
-- ============================================================

-- INSERT INTO users (nama, email, password, is_admin)
-- VALUES ('Admin', 'admin@keepnsleep.id', '<bcrypt_hash>', TRUE);
