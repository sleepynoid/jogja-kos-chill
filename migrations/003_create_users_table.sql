-- Migration: 003_create_users_table
-- Description: Create users table for regular users (pencari kos)

CREATE TABLE users (
    uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama          VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password      TEXT NOT NULL,
    telepon       VARCHAR(20),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Wishlist: user menyimpan kos favorit
CREATE TABLE user_wishlist (
    user_uuid   UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    kos_uuid    UUID NOT NULL REFERENCES kos(uuid) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_uuid, kos_uuid)
);

CREATE INDEX idx_user_wishlist_user ON user_wishlist(user_uuid);

-- Trigger updated_at for users
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
