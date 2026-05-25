-- Migration: 002_seed_reference_data
-- Description: Seed master/reference tables with initial data

-- ============================================================
-- SEED: MITRA
-- ============================================================

-- Password for all seed mitra: password123
-- bcrypt hash: $2b$12$jjFQc.pgub73W71xoRzgGOrQArY3z/sZ.JzusCOSQh.xJT.3k5fdm

INSERT INTO mitra (nama, email, password, telepon, is_premium) VALUES
    ('Pak Harto Widodo',   'harto.widodo@email.com',  '$2b$12$jjFQc.pgub73W71xoRzgGOrQArY3z/sZ.JzusCOSQh.xJT.3k5fdm', '6281234567001', TRUE),
    ('Bu Siti Rahayu',     'siti.rahayu@email.com',   '$2b$12$jjFQc.pgub73W71xoRzgGOrQArY3z/sZ.JzusCOSQh.xJT.3k5fdm', '6281234567002', FALSE),
    ('Mas Andi Prasetyo',  'andi.prasetyo@email.com', '$2b$12$jjFQc.pgub73W71xoRzgGOrQArY3z/sZ.JzusCOSQh.xJT.3k5fdm', '6281234567003', TRUE),
    ('Bu Dewi Lestari',    'dewi.lestari@email.com',  '$2b$12$jjFQc.pgub73W71xoRzgGOrQArY3z/sZ.JzusCOSQh.xJT.3k5fdm', '6281234567004', FALSE);

-- ============================================================
-- SEED: DAERAH
-- ============================================================

INSERT INTO daerah (slug, nama) VALUES
    ('malioboro',   'Malioboro'),
    ('kotagede',    'Kotagede'),
    ('depok',       'Depok, Sleman'),
    ('kasihan',     'Kasihan, Bantul'),
    ('umbulharjo',  'Umbulharjo'),
    ('jetis',       'Jetis');

-- ============================================================
-- SEED: KAMPUS
-- ============================================================

INSERT INTO kampus (slug, nama) VALUES
    ('ugm',  'Universitas Gadjah Mada (UGM)'),
    ('uny',  'Universitas Negeri Yogyakarta (UNY)'),
    ('uin',  'UIN Sunan Kalijaga'),
    ('upn',  'UPN "Veteran" Yogyakarta'),
    ('isi',  'Institut Seni Indonesia (ISI) Yogyakarta'),
    ('uii',  'Universitas Islam Indonesia (UII)'),
    ('umy',  'Universitas Muhammadiyah Yogyakarta (UMY)'),
    ('ukdw', 'Universitas Kristen Duta Wacana (UKDW)');

-- ============================================================
-- SEED: FASILITAS
-- ============================================================

INSERT INTO fasilitas (nama) VALUES
    ('WiFi'),
    ('WiFi 100Mbps'),
    ('WiFi 150Mbps'),
    ('WiFi 200Mbps'),
    ('AC'),
    ('Kipas Angin'),
    ('Kamar Mandi Dalam'),
    ('Air Panas'),
    ('Laundry'),
    ('Dapur Bersama'),
    ('Parkir Motor'),
    ('Parkir Mobil'),
    ('CCTV'),
    ('Smart TV'),
    ('Kulkas'),
    ('Cleaning Service'),
    ('Gym'),
    ('Rooftop'),
    ('Mushola'),
    ('Taman');
