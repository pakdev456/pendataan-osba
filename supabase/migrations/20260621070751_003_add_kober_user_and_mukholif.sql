-- Update admin user to bendahara
UPDATE users SET username = 'bendahara', name = 'Bendahara OSBA' WHERE username = 'admin';

-- Insert kober user
INSERT INTO users (username, password_hash, name, role)
VALUES ('kober', '8c95c2411a66a0445f837b7a26b20d353fbf52b689e57efa1fccfb3c4bd198a8', 'Pengawas Qism Ibadah', 'ibadah')
ON CONFLICT (username) DO NOTHING;

-- Create mukholif (pelanggaran ibadah) table
CREATE TABLE IF NOT EXISTS mukholif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  catatan TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mukholif ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_mukholif" ON mukholif FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_mukholif_date ON mukholif(date);
CREATE INDEX IF NOT EXISTS idx_mukholif_kelas ON mukholif(kelas);
