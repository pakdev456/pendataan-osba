-- Qism Kebersihan: dav
INSERT INTO users (username, password_hash, name, role)
VALUES ('dav', '1fff33d428fa7ee50c7ba5eb3242654d4f4afa30cc3eceff0a252d4009687981', 'Pengawas Qism Kebersihan', 'kebersihan')
ON CONFLICT (username) DO NOTHING;

-- Qism Bahasa: kan
INSERT INTO users (username, password_hash, name, role)
VALUES ('kan', 'ee8f4d1dad0ff29d1f2a4d01c04efd551c9472a887a0ad73206ac4318cb9a597', 'Pengawas Qism Bahasa', 'bahasa')
ON CONFLICT (username) DO NOTHING;

-- Qism Keamanan: pai
INSERT INTO users (username, password_hash, name, role)
VALUES ('pai', '7e6578bef7bb83f9788290452c2e27fc34b5a494c39effb1f19a6fb3dc097d2f', 'Pengawas Qism Keamanan', 'keamanan')
ON CONFLICT (username) DO NOTHING;

-- Tabel pelanggaran Qism Kebersihan
CREATE TABLE IF NOT EXISTS pelanggaran_kebersihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  catatan TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pelanggaran_kebersihan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_pelanggaran_kebersihan" ON pelanggaran_kebersihan FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_kebersihan_date ON pelanggaran_kebersihan(date);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_kebersihan_kelas ON pelanggaran_kebersihan(kelas);

-- Tabel pelanggaran Qism Bahasa
CREATE TABLE IF NOT EXISTS pelanggaran_bahasa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  catatan TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pelanggaran_bahasa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_pelanggaran_bahasa" ON pelanggaran_bahasa FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_bahasa_date ON pelanggaran_bahasa(date);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_bahasa_kelas ON pelanggaran_bahasa(kelas);

-- Tabel pelanggaran Qism Keamanan
CREATE TABLE IF NOT EXISTS pelanggaran_keamanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  catatan TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pelanggaran_keamanan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_pelanggaran_keamanan" ON pelanggaran_keamanan FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_keamanan_date ON pelanggaran_keamanan(date);
CREATE INDEX IF NOT EXISTS idx_pelanggaran_keamanan_kelas ON pelanggaran_keamanan(kelas);
