-- Migration: 001_create_tables
-- Description: Initial schema for Keep n Sleep (Jogja Kos Chill)
-- Database: PostgreSQL

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE jenis_kos AS ENUM ('putra', 'putri', 'campuran', 'exclusive');
CREATE TYPE inquiry_status AS ENUM ('pending', 'dihubungi');

-- ============================================================
-- REFERENCE / MASTER TABLES
-- ============================================================

CREATE TABLE daerah (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(50) NOT NULL UNIQUE,   -- e.g. 'malioboro', 'depok'
    nama        VARCHAR(100) NOT NULL,         -- e.g. 'Malioboro', 'Depok, Sleman'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE kampus (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(50) NOT NULL UNIQUE,   -- e.g. 'ugm', 'uny'
    nama        VARCHAR(150) NOT NULL,         -- e.g. 'Universitas Gadjah Mada (UGM)'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fasilitas (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama        VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'WiFi', 'AC', 'Kamar Mandi Dalam'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: MITRA (pemilik kos)
-- ============================================================

CREATE TABLE mitra (
    uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama          VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    telepon       VARCHAR(20),
    is_premium    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mitra_email ON mitra(email);
CREATE INDEX idx_mitra_premium ON mitra(is_premium) WHERE is_premium = TRUE;

-- ============================================================
-- MAIN TABLE: KOS
-- ============================================================

CREATE TABLE kos (
    uuid            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mitra_uuid      UUID NOT NULL REFERENCES mitra(uuid) ON DELETE RESTRICT,
    nama            VARCHAR(200) NOT NULL,
    jenis           jenis_kos NOT NULL,
    daerah_uuid     UUID NOT NULL REFERENCES daerah(uuid) ON DELETE RESTRICT,
    alamat          TEXT NOT NULL,
    harga_per_bulan INT NOT NULL CHECK (harga_per_bulan > 0),
    rating          NUMERIC(2, 1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    gambar          TEXT,                       -- URL foto utama
    deskripsi       TEXT,
    ktp_pemilik     TEXT NOT NULL,       -- No. KTP pemilik
    nib             TEXT NOT NULL,       -- Nomor Induk Berusaha
    tersedia        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kos_mitra ON kos(mitra_uuid);
CREATE INDEX idx_kos_jenis ON kos(jenis);
CREATE INDEX idx_kos_daerah ON kos(daerah_uuid);
CREATE INDEX idx_kos_harga ON kos(harga_per_bulan);
CREATE INDEX idx_kos_rating ON kos(rating DESC);
CREATE INDEX idx_kos_tersedia ON kos(tersedia) WHERE tersedia = TRUE;

-- ============================================================
-- JUNCTION TABLE: KOS <-> KAMPUS TERDEKAT (many-to-many)
-- ============================================================

CREATE TABLE kos_kampus_terdekat (
    kos_uuid    UUID NOT NULL REFERENCES kos(uuid) ON DELETE CASCADE,
    kampus_uuid UUID NOT NULL REFERENCES kampus(uuid) ON DELETE CASCADE,
    PRIMARY KEY (kos_uuid, kampus_uuid)
);

CREATE INDEX idx_kos_kampus_kampus ON kos_kampus_terdekat(kampus_uuid);

-- ============================================================
-- JUNCTION TABLE: KOS <-> FASILITAS (many-to-many)
-- ============================================================

CREATE TABLE kos_fasilitas (
    kos_uuid       UUID NOT NULL REFERENCES kos(uuid) ON DELETE CASCADE,
    fasilitas_uuid UUID NOT NULL REFERENCES fasilitas(uuid) ON DELETE CASCADE,
    PRIMARY KEY (kos_uuid, fasilitas_uuid)
);

CREATE INDEX idx_kos_fasilitas_fasilitas ON kos_fasilitas(fasilitas_uuid);

-- ============================================================
-- TABLE: KOS GALERI (one-to-many, ordered photos)
-- ============================================================

CREATE TABLE kos_galeri (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kos_uuid    UUID NOT NULL REFERENCES kos(uuid) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    urutan      SMALLINT NOT NULL DEFAULT 0,   -- ordering position
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kos_galeri_kos ON kos_galeri(kos_uuid, urutan);

-- ============================================================
-- TABLE: KOS INQUIRY (leads / pertanyaan calon penyewa)
-- ============================================================

CREATE TABLE kos_inquiry (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kos_uuid    UUID NOT NULL REFERENCES kos(uuid) ON DELETE CASCADE,
    nama_calon  VARCHAR(150) NOT NULL,
    telepon     VARCHAR(20) NOT NULL,
    pesan       TEXT,
    status      inquiry_status NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kos_inquiry_kos ON kos_inquiry(kos_uuid);
CREATE INDEX idx_kos_inquiry_status ON kos_inquiry(status);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mitra_updated_at
    BEFORE UPDATE ON mitra
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_kos_updated_at
    BEFORE UPDATE ON kos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_kos_inquiry_updated_at
    BEFORE UPDATE ON kos_inquiry
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
