**ReadBuddy AI** adalah aplikasi web skrining literasi interaktif berbasis kecerdasan buatan (*AI-powered literacy screening*) yang dirancang khusus untuk murid sekolah dasar (Grade 1–4). Platform ini menggabungkan penilaian kelancaran membaca berbasis suara (*speech-to-text oral fluency*) dengan diagnostik pemahaman bertingkat **Taksonomi Bloom (C1–C4)** berlatar cerita rakyat Asia Tenggara (Indonesia, Filipina, Malaysia).

---

## 🌟 Fitur Utama

### 1. Dual-Stage Screening Pipeline
* **Tahap 1: Reading Oral Fluency**
  * Memproses suara murid secara *real-time* di sisi klien (*Client-side Web Speech API*) tanpa menyimpan data audio mentah (*privacy-first*).
  * Menghitung metrik objektif: **WCPM** (*Words Correct Per Minute*), persentase akurasi, dan deteksi kata yang perlu dilatih ulang.
* **Tahap 2: Interactive Bloom's Taxonomy Matrix (C1–C4)**
  * **C1 (Remembering - 15%)**: Menguji ingatan fakta eksplisit (Tokoh, Tempat, Waktu).
  * **C2 (Understanding - 25%)**: Menjelaskan hubungan sebab-akibat cerita via interaksi *matching pairs*.
  * **C3 (Applying - 30%)**: Menerapkan nilai moral cerita ke situasi nyata di sekolah/rumah.
  * **C4 (Analysing - 30%)**: Menganalisis motif tokoh, aspek keselamatan, prioritas, dan *trade-off*.

### 2. Teacher-Verified AI Generation Flow
* **Zero Unverified Content**: Murid hanya dapat mengakses cerita dan soal yang telah dibuat oleh AI dan **disetujui/diverifikasi secara manual oleh guru** (*human-in-the-loop*).
* **Grade-Adaptive Engine**: Kompleksitas teks cerita dan rubrik kuis menyesuaikan standar jenjang (Grade 1 hingga Grade 4).
* **ASEAN Cultural Randomizer**: Variasi latar cerita rakyat dirandomisasi dari Indonesia 🇮🇩, Filipina 🇵🇭, dan Malaysia 🇲🇾.

### 3. Educator Analytics & Diagnostic Portal
* **Student Entity Grouping**: Mengelompokkan seluruh riwayat pengerjaan murid ke dalam profil tunggal tanpa duplikasi data.
* **Longitudinal Progress Tracking**: Memantau grafik pertumbuhan skor *composite* dan capaian tiap level Bloom secara historis.
* **Clinical AI Prescription**: Gemini AI secara otomatis merangkum **Kekuatan Utama (*Strength*)**, **Hambatan Fonik/Kognitif (*Weakness*)**, dan **Rekomendasi Intervensi Kelas (*Action Plan*)**.

---

## 📐 Formula & Rubrik Penilaian

$$\text{WCPM} = \frac{\text{Jumlah Kata Benar Dibaca}}{\text{Durasi Membaca (detik)} / 60}$$

$$\text{Akurasi (\%)} = \left( \frac{\text{Jumlah Kata Benar Dibaca}}{\text{Total Kata Teks Acuan}} \right) \times 100$$

$$\text{Composite Score} = (0.3 \times \text{Normalized Fluency}) + (0.7 \times \text{Total Bloom Score})$$

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling & Animation**: Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti
* **Speech Processing**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
* **AI Engine**: Google Gemini API (`gemini-1.5-flash` via `@google/genai`)
* **Database**: Supabase (Serverless PostgreSQL)
* **Deployment**: Vercel

---

## 📁 Struktur Direktori

```text
readbuddy-ai/
├── app/
│   ├── api/
│   │   ├── evaluate/route.ts        # AI scoring & diagnostic summary
│   │   └── generate-quest/route.ts  # Grade-adaptive story & question generator
│   ├── layout.tsx
│   └── page.tsx                     # Entry hub (Student join & Portal switch)
├── components/
│   ├── StudentScreeningQuest.tsx    # Interactive student wizard (Voice + C1-C4)
│   └── TeacherDashboard.tsx         # Class management, AI verification & analytics
├── lib/
│   ├── speechEngine.ts              # Client-side Speech-to-Text & WCPM calculator
│   ├── storyData.ts                 # Type definitions & fallback quest templates
│   └── supabase.ts                  # Supabase client singleton
└── .env.local                       # Environment variables
```
🚀 Panduan Instalasi Lokal
1. Kloning Repositori
```
Bash
git clone [https://github.com/USERNAME/readbuddy-ai.git](https://github.com/USERNAME/readbuddy-ai.git)
cd readbuddy-ai
```
3. Pasang Dependensi
```
Bash
npm install
```
5. Setup Environment Variables
Buat file .env.local di root proyek:
```

Code snippet
# Google Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
4. Setup Skema Database (Supabase SQL Editor)
Jalankan skrip SQL berikut di dashboard Supabase Anda

SQL
```
-- 1. Table Classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'Grade 2',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table Students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  class_code TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '🐻',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table Stories (AI Story Bank)
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  class_code TEXT NOT NULL,
  grade TEXT NOT NULL,
  interest TEXT NOT NULL,
  country_origin TEXT NOT NULL,
  title TEXT NOT NULL,
  passage_text TEXT NOT NULL,
  word_count INT NOT NULL,
  c1_data JSONB NOT NULL,
  c2_data JSONB NOT NULL,
  c3_data JSONB NOT NULL,
  c4_data JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  class_code TEXT NOT NULL,
  story_title TEXT NOT NULL,
  wcpm FLOAT NOT NULL,
  accuracy FLOAT NOT NULL,
  c1_score FLOAT NOT NULL,
  c2_score FLOAT NOT NULL,
  c3_score FLOAT NOT NULL,
  c4_score FLOAT NOT NULL,
  total_bloom_score FLOAT NOT NULL,
  composite_score FLOAT NOT NULL,
  status TEXT NOT NULL,
  transcribed_text TEXT,
  words_to_practice TEXT[],
  strength TEXT,
  weakness TEXT,
  solution TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
5. Jalankan Server Pengembangan
```
Bash
npm run dev
```
Buka browser di http://localhost:3000.

🔑 Kredensial Demo Guru
Portal: Akses tombol Teacher Portal di pojok kanan atas
```
Username: guru

Password: admin123
