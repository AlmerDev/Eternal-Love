-- =========================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ETERNAL LOVE (CIYAN & DAFFA)
-- =========================================================================
-- Cara Penggunaan:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih project kamu -> Klik menu "SQL Editor" di bilah sisi kiri
-- 3. Klik "New Query", paste semua kode SQL di bawah ini, lalu klik "Run"
-- 4. Semua tabel, RLS, Storage Bucket, dan Data Awal akan terbuat otomatis!
-- =========================================================================

-- 1. STORAGE BUCKETS (Untuk upload gambar cover, stiker piringan hitam, foto, dan audio)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('media', 'media', true),
  ('photos', 'photos', true),
  ('covers', 'covers', true),
  ('vinyl_stickers', 'vinyl_stickers', true),
  ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies (Memberikan akses baca dan upload publik untuk kemudahan demo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Media Read'
  ) THEN
    CREATE POLICY "Public Media Read" ON storage.objects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Media Insert'
  ) THEN
    CREATE POLICY "Public Media Insert" ON storage.objects FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Media Update'
  ) THEN
    CREATE POLICY "Public Media Update" ON storage.objects FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Media Delete'
  ) THEN
    CREATE POLICY "Public Media Delete" ON storage.objects FOR DELETE USING (true);
  END IF;
END $$;

-- 2. TABEL: songs (Piringan Hitam & Lagu Romantis)
CREATE TABLE IF NOT EXISTS public.songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  category TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  vinyl_photo_url TEXT NOT NULL,
  lyrics TEXT,
  duration TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: photos (Foto Kenangan PDKT & 3D Exhibition)
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  date TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  rotation NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: countdowns (Detik Kasih & Hari Spesial)
CREATE TABLE IF NOT EXISTS public.countdowns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL: secret_messages (Surat Gores Rahasia Cinta)
CREATE TABLE IF NOT EXISTS public.secret_messages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  scratch_percent_required INTEGER DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL: settings (Pengaturan Global & Perjalanan Sejak)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public Read & Write Access
DO $$
BEGIN
  -- songs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'songs' AND policyname = 'Allow public read songs') THEN
    CREATE POLICY "Allow public read songs" ON public.songs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'songs' AND policyname = 'Allow public write songs') THEN
    CREATE POLICY "Allow public write songs" ON public.songs FOR ALL USING (true);
  END IF;

  -- photos policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Allow public read photos') THEN
    CREATE POLICY "Allow public read photos" ON public.photos FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Allow public write photos') THEN
    CREATE POLICY "Allow public write photos" ON public.photos FOR ALL USING (true);
  END IF;

  -- countdowns policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'countdowns' AND policyname = 'Allow public read countdowns') THEN
    CREATE POLICY "Allow public read countdowns" ON public.countdowns FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'countdowns' AND policyname = 'Allow public write countdowns') THEN
    CREATE POLICY "Allow public write countdowns" ON public.countdowns FOR ALL USING (true);
  END IF;

  -- secret_messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'secret_messages' AND policyname = 'Allow public read secrets') THEN
    CREATE POLICY "Allow public read secrets" ON public.secret_messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'secret_messages' AND policyname = 'Allow public write secrets') THEN
    CREATE POLICY "Allow public write secrets" ON public.secret_messages FOR ALL USING (true);
  END IF;

  -- settings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public read settings') THEN
    CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public write settings') THEN
    CREATE POLICY "Allow public write settings" ON public.settings FOR ALL USING (true);
  END IF;
END $$;

-- =========================================================================
-- INITIAL SEED DATA (DATA AWAL ROMANTIS CIYAN & DAFFA)
-- =========================================================================

-- Seed Songs
INSERT INTO public.songs (id, title, artist, category, audio_url, cover_url, vinyl_photo_url, lyrics, duration, order_index)
VALUES
  ('song-bgm-1', 'Sampai Jadi Debu (Acoustic Ambient)', 'Banda Neira', 'bgm', '', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop&q=80', 'Meredup bijak, saling menjaga. Selamanya berdua sampai kita jadi debu...', '3:45', 0),
  ('song-abadi-1', 'Lagu Abadi Kita (Sempurna)', 'Andra and The Backbone', 'abadi', '', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=80', 'Kau adalah darahku, kau adalah jantungku. Kau adalah hidupku, lengkapi diriku...', '4:20', 1),
  ('song-ciyan-1', 'Monokrom', 'Tulus (Pilihan Favorit Ciyan)', 'ciyan', '', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 'Di mana pun kalian berada, ku kirimkan terima kasih untuk warna dalam hidupku...', '3:34', 2),
  ('song-ciyan-2', 'Until I Found You', 'Stephen Sanchez (Pilihan Favorit Ciyan)', 'ciyan', '', 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 'I would never fall in love until I found her, until I found you...', '2:58', 3),
  ('song-ciyan-3', 'Golden Hour', 'JVKE (Acoustic Scrapbook Mix)', 'ciyan', '', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', 'She got glitter for skin, my radiant beam in the night...', '3:29', 4),
  ('song-daffa-1', 'Komang', 'Raim Laode (Pilihan Favorit Daffa)', 'daffa', '', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', 'Sebab kau terlalu indah dari sekadar kata. Dunia hentikanlah sejenak...', '3:42', 5),
  ('song-daffa-2', 'Can''t Take My Eyes Off You', 'Frankie Valli (Pilihan Favorit Daffa)', 'daffa', '', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', 'You are just too good to be true, cant take my eyes off of you...', '3:20', 6),
  ('song-daffa-3', 'Nanti Kita Seperti Ini', 'Batas Senja (Pilihan Favorit Daffa)', 'daffa', '', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', 'Ingin punya rumah tuk tempat pulang bersama dirimu setiap senja...', '3:50', 7)
ON CONFLICT (id) DO NOTHING;

-- Seed PDKT Photos
INSERT INTO public.photos (id, title, caption, date, location, image_url, category, rotation, order_index)
VALUES
  ('photo-1', 'Awal Mula Chat Pertama', 'Masih canggung menyapa lewat pesan singkat larut malam. Siapa sangka ini awal dari segalanya.', '14 Agustus 2023', 'Ruang Pesan Kita', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80', 'pdkt', -2, 1),
  ('photo-2', 'Kopi & Hujan Pertama', 'Gerimis sore di sudut kedai favorit. Ciyan tersenyum malu saat memesan matcha latte hangat.', '28 Agustus 2023', 'Kedai Kopi Sudut Kota', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80', 'pdkt', 3, 2),
  ('photo-3', 'Jalan Sore & Es Krim Gelato', 'Berbagi tawa sambil mencicipi rasa gelato favorit kita berdua. Detik itu waktu rasanya berhenti.', '10 September 2023', 'Pedestrian Boulevard', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80', 'pdkt', -1.5, 3),
  ('photo-4', 'Senja di Atas Bukit', 'Langit jingga merah muda menemanimu yang bercerita tentang mimpi-mimpimu. Daffa jatuh cinta lagi.', '20 September 2023', 'Bukit Bintang Kenangan', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80', 'pdkt', 2.5, 4),
  ('photo-5', 'Hari Resmi Bersama: 29 September', 'Di bawah sorot lampu redup dan detak jantung yang berdebar kencang, dua hati berikrar satu tujuan selamanya.', '29 September 2023', 'Tempat Rahasia Kita', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80', 'pdkt', -3, 5),
  ('photo-6', 'Kebun Mawar Merah Jambu', 'Bunga-bunga vintage bermekaran mengiringi langkah kita bergandengan tangan.', '18 Oktober 2023', 'Kebun Raya Asri', 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&auto=format&fit=crop&q=80', '3d_exhibition', 1, 6),
  ('photo-7', 'Malam Cahaya Lilin', 'Setiap tatapan matamu memancarkan kehangatan yang menenangkan seluruh gundahku.', '24 Desember 2023', 'Bistro Klasik', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80', '3d_exhibition', -2, 7),
  ('photo-8', 'Menyambut Tahun Baru Berdua', 'Harapan pertama di detik pertama tahun baru: agar Ciyan & Daffa selalu bersama selamanya.', '31 Desember 2023', 'Dermaga Bintang', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80', '3d_exhibition', 2, 8),
  ('photo-9', 'Piknik Bunga & Buku Puisi', 'Membaca bait-bait romantis sambil menikmati angin sepoi-sepoi di bawah pohon rindang.', '14 Februari 2024', 'Taman Sakura Vintage', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80', '3d_exhibition', -1, 9),
  ('photo-10', 'Genggaman Tangan di Pantai', 'Deburan ombak senja menjadi saksi genggaman tangan yang takkan pernah saling melepaskan.', '28 Mei 2024', 'Pantai Pasir Putih', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', '3d_exhibition', 1.5, 10),
  ('photo-11', 'Senyum Manis Ciyan di Hari Bahagia', 'Melihat senyum lepasmu adalah kebahagiaan terbesar yang selalu ingin Daffa jaga selamanya.', '18 April 2024', 'Paviliun Mawar Merah Muda', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80', '3d_exhibition', -2, 11)
ON CONFLICT (id) DO NOTHING;

-- Seed Countdowns
INSERT INTO public.countdowns (id, title, target_date, category, description, badge)
VALUES
  ('cd-anniv', 'Hari Jadi Kita (Next Anniversary)', '2027-09-29T00:00:00', 'anniversary', 'Momen sakral saat Ciyan & Daffa mengawali kisah cinta abadi pada 29 September.', 'Momen Paling Spesial'),
  ('cd-ciyan', 'Ulang Tahun Ciyan Terkasih', '2027-04-18T00:00:00', 'birthday_ciyan', 'Hari terlahirnya bidadari yang menjadi rumah terhangat bagi Daffa.', 'Ciyan Birthday'),
  ('cd-daffa', 'Ulang Tahun Daffa', '2027-11-05T00:00:00', 'birthday_daffa', 'Hari bertambahnya usia pangeran penjaga hati Ciyan tercinta.', 'Daffa Birthday')
ON CONFLICT (id) DO NOTHING;

-- Seed Secret Messages
INSERT INTO public.secret_messages (id, title, message, author, scratch_percent_required)
VALUES
  ('secret-1', 'Surat Rahasia #1: Untuk Ciyan Sayang', 'Hai Ciyan sayangku, terima kasih sudah hadir dan mengubah duniaku jadi penuh warna merah muda. Sejak 29 September 2023, tujuanku cuma satu: membahagiakanmu setiap hari tanpa henti. Aku sayang kamu selamanya!', 'Daffa', 40),
  ('secret-2', 'Surat Rahasia #2: Janji di Bawah Bintang', 'Tidak peduli seberapa deras badai di luar sana, genggaman tanganku takkan pernah terlepas. Kamu adalah rumah, tempat terbaik untuk pulang di setiap senja. Love you more than words can say, Ciyan.', 'Daffa', 45)
ON CONFLICT (id) DO NOTHING;

-- Seed Settings (Perjalanan Sejak & Waktu Jadian)
INSERT INTO public.settings (id, key, value)
VALUES (
  'setting-journey',
  'journey_settings',
  '{"startDate":"2023-09-29T00:00:00","badgeText":"Bersama Sejak 29 September 2023","title":"Perjalanan Indah Kita Berdua","description":"Tidak ada satu detik pun yang berlalu tanpa rasa syukur karena memilikimu di sisiku."}'
)
ON CONFLICT (id) DO NOTHING;
