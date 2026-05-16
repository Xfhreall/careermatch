# Product Requirements Document (PRD)
## CareerMatch — AI Job Matching Agent

---

| Atribut | Detail |
|---|---|
| Versi | 2.0.0 — Rebuild from Prototype |
| Status | Draft untuk Review Engineering |
| Tanggal | 16 Mei 2026 |
| Produk | CareerMatch / AI Career Match |
| Fokus Versi | MVP Web App: Upload CV → AI Job Matching → Career Coaching |
| Role Utama | `jobseeker`, `hrd`, `superadmin` |
| Integrasi Saat Ini | n8n Webhook, GPT-4o, Supabase Vector DB |
| Prioritas | P0 — Core Matching Experience |

---

## 1. Ringkasan Eksekutif

CareerMatch adalah aplikasi web berbasis AI yang membantu jobseeker menemukan posisi pekerjaan yang paling sesuai berdasarkan isi CV. Jobseeker mengunggah CV dalam format PDF/DOC/DOCX, lalu sistem menjalankan pipeline AI untuk membaca CV, melakukan anonimisasi data pribadi, mencocokkan profil dengan database lowongan, menghitung skor kompatibilitas, dan memberikan saran karier yang dapat ditindaklanjuti.

Prototype saat ini menunjukkan MVP single-page application dengan integrasi langsung ke webhook n8n. Versi PRD ini menyelaraskan kebutuhan produk dengan perilaku prototype tersebut, sekaligus mendefinisikan fondasi untuk pengembangan ke platform fullstack multi-role pada fase berikutnya.

### Nilai Utama Produk

- **Untuk jobseeker:** mengetahui lowongan yang paling cocok, skor kecocokan, skill yang sudah sesuai, skill gap, dan rekomendasi karier.
- **Untuk HRD:** pada fase lanjutan, mengelola lowongan dan melihat kandidat anonim berdasarkan skor kecocokan.
- **Untuk superadmin:** pada fase lanjutan, mengelola user, lowongan, workflow AI, monitoring, dan konfigurasi sistem.

---

## 2. Analisis Prototype Saat Ini

Prototype `ai-job-matching.html` merepresentasikan MVP dengan flow utama berikut:

1. Jobseeker membuka landing page CareerMatch.
2. Jobseeker mengunggah file CV melalui upload zone.
3. UI menampilkan nama file dan ukuran file.
4. Jobseeker menekan tombol **Analisis CV & Temukan Pekerjaan**.
5. Frontend memvalidasi bahwa file sudah dipilih.
6. Frontend menampilkan loading state dengan lima tahap pipeline:
   - Membaca dan mengekstrak teks CV
   - Anonimisasi data PII
   - Mencari pekerjaan yang cocok di database
   - Menghitung skor kompatibilitas
   - Menyiapkan saran karier dan pertanyaan interview
7. Frontend mengirim `FormData` ke webhook n8n.
8. Backend/workflow AI mengembalikan JSON atau Markdown.
9. Frontend mencoba mengekstrak data job match terstruktur.
10. Jika job match ditemukan, UI menampilkan score cards dan daftar pekerjaan.
11. Jika data terstruktur tidak ditemukan, UI tetap menampilkan raw output pada tab **Full Report**.
12. Jobseeker dapat menekan tombol **Analisis CV Baru** untuk reset state.

### Observasi Engineering

Prototype saat ini belum memiliki autentikasi, database session, riwayat analisis, dashboard HRD, dashboard superadmin, penyimpanan report, atau STAR chatbot interaktif. Karena itu, fitur tersebut dikategorikan sebagai roadmap, bukan MVP utama.

---

## 3. Problem Statement

Jobseeker sering tidak mengetahui posisi pekerjaan mana yang paling cocok dengan CV mereka. Mereka juga sering kesulitan memahami skill gap dan tidak mendapatkan feedback yang spesifik, objektif, dan actionable. Di sisi lain, proses screening pekerjaan cenderung terasa seperti black box karena kandidat hanya mengetahui hasil akhir tanpa penjelasan kecocokan.

CareerMatch menyelesaikan masalah ini dengan memberikan:

- Analisis CV otomatis.
- Matching lowongan berdasarkan skill dan pengalaman.
- Skor kompatibilitas transparan.
- Skill yang cocok dan skill yang perlu dipelajari.
- Rekomendasi karier berbasis AI.
- Laporan lengkap yang dapat dibaca ulang.

---

## 4. Target Pengguna dan Role

### 4.1 Role: `jobseeker`

Role default untuk pengguna yang ingin menganalisis CV dan menemukan pekerjaan yang sesuai.

**Kebutuhan utama:**

- Upload CV.
- Mendapatkan rekomendasi pekerjaan.
- Melihat skor kecocokan.
- Mengetahui skill gap.
- Mendapatkan saran karier.
- Melihat laporan lengkap hasil analisis.

**Hak akses MVP:**

- Mengakses landing page.
- Mengunggah CV.
- Melihat hasil analisis pada sesi yang sama.
- Melakukan reset untuk analisis baru.

**Hak akses fase lanjutan:**

- Login via Google.
- Melihat riwayat analisis.
- Menyimpan hasil analisis.
- Mengunduh report PDF.
- Mengakses simulasi interview STAR.

### 4.2 Role: `hrd`

Role untuk recruiter/perusahaan pada fase lanjutan.

**Kebutuhan utama:**

- Membuat dan mengelola lowongan.
- Mendefinisikan required skills dan minimum years of experience.
- Melihat kandidat anonim yang cocok dengan lowongan.
- Mengekspor laporan kandidat anonim.

### 4.3 Role: `superadmin`

Role administrator internal platform.

**Kebutuhan utama:**

- Mengelola akun jobseeker dan HRD.
- Approve/reject registrasi HRD.
- Mengelola semua lowongan.
- Monitoring webhook, AI cost, latency, error rate.
- Mengatur scoring weight dan model AI.

### 4.4 Matriks Role

| Fitur | jobseeker | hrd | superadmin |
|---|:---:|:---:|:---:|
| Upload CV | ✅ | ❌ | ✅ |
| Lihat hasil analisis sendiri | ✅ | ❌ | ✅ |
| Lihat job match | ✅ | ❌ | ✅ |
| Lihat career coaching | ✅ | ❌ | ✅ |
| Kelola lowongan | ❌ | ✅ | ✅ |
| Lihat kandidat anonim | ❌ | ✅ | ✅ |
| Lihat identitas asli kandidat | ❌ | ❌ | ✅ |
| Approve akun HRD | ❌ | ❌ | ✅ |
| Monitoring workflow | ❌ | ❌ | ✅ |
| Konfigurasi scoring/model | ❌ | ❌ | ✅ |

---

## 5. Scope MVP

### 5.1 In Scope

- Landing page CareerMatch.
- Upload CV via click atau drag-and-drop.
- Dukungan file PDF, DOC, dan DOCX.
- Validasi minimal file wajib dipilih.
- Pengiriman file ke webhook n8n menggunakan `multipart/form-data`.
- Loading state berbasis pipeline step.
- Render hasil job matching.
- Render score cards:
  - Compatibility score.
  - Skill match score.
  - Experience match score.
- Render daftar job match.
- Render matched skills dan skill gap.
- Render career coaching berbasis Markdown.
- Render raw/full report sebagai fallback.
- Reset flow untuk analisis baru.

### 5.2 Out of Scope MVP

- Login/register.
- Persistensi riwayat analisis.
- Dashboard jobseeker.
- Dashboard HRD.
- Dashboard superadmin.
- Approval HRD.
- STAR chatbot interaktif.
- PDF export.
- Payment/subscription.
- Email notification.
- Multi-language report.

Fitur out of scope tetap masuk roadmap setelah MVP stabil.

---

## 6. User Journey MVP

### 6.1 Happy Path

1. Jobseeker membuka halaman utama.
2. Jobseeker membaca value proposition.
3. Jobseeker memilih atau drag-and-drop CV.
4. Sistem menampilkan file yang dipilih.
5. Jobseeker klik tombol analisis.
6. Sistem menampilkan loading pipeline.
7. Sistem mengirim file ke webhook.
8. Workflow AI memproses file.
9. Sistem menerima response.
10. UI menampilkan hasil analisis.
11. Jobseeker membuka tab:
    - Job Matches.
    - Career Coach.
    - Full Report.
12. Jobseeker dapat memulai analisis baru.

### 6.2 Empty File Path

1. Jobseeker klik tombol analisis tanpa memilih file.
2. Sistem menampilkan error: `Silakan upload file CV terlebih dahulu.`
3. Sistem tidak mengirim request ke webhook.

### 6.3 Backend Error Path

1. Jobseeker sudah memilih file.
2. Sistem mengirim file ke webhook.
3. Webhook mengembalikan non-2xx response atau koneksi gagal.
4. Sistem menyembunyikan loading.
5. Tombol submit aktif kembali.
6. Sistem menampilkan error: `Gagal terhubung ke server: {message}`.

### 6.4 Unstructured Response Path

1. Backend mengembalikan response yang tidak memiliki field job match terstruktur.
2. Sistem menyembunyikan score grid.
3. Sistem menampilkan pesan bahwa data job match terstruktur tidak ditemukan.
4. Sistem tetap menampilkan raw response pada tab Full Report.

---

## 7. Functional Requirements

### FR-001 — Upload CV

Sistem harus menyediakan area upload CV yang dapat digunakan dengan klik maupun drag-and-drop.

**Acceptance Criteria:**

- Upload zone dapat menerima file dari file picker.
- Upload zone dapat menerima file dari drag-and-drop.
- Setelah file dipilih, nama file dan ukuran file ditampilkan.
- File input menerima ekstensi `.pdf`, `.doc`, dan `.docx`.

### FR-002 — Validasi Sebelum Submit

Sistem harus mencegah submit jika belum ada file.

**Acceptance Criteria:**

- Jika file kosong, tampilkan error.
- Tidak ada request network yang dikirim.
- Tombol submit tetap aktif.

### FR-003 — Submit ke Webhook

Sistem harus mengirim file CV ke endpoint webhook menggunakan `POST multipart/form-data`.

**Request Contract:**

```http
POST {WEBHOOK_URL}
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Description |
|---|---|:---:|---|
| `cv` | File | ✅ | File CV yang diunggah jobseeker |
| `filename` | string | ✅ | Nama file asli |

### FR-004 — Loading Pipeline

Sistem harus menampilkan loading state saat proses analisis berjalan.

**Acceptance Criteria:**

- Tombol submit disabled selama proses berlangsung.
- Loading overlay tampil.
- Step pipeline berganti status secara periodik.
- Setelah response diterima atau error terjadi, interval loading dihentikan.

### FR-005 — Render Score Overview

Sistem harus menampilkan tiga skor utama jika data job match tersedia.

**Field yang digunakan:**

| UI | Response Field |
|---|---|
| Kompatibilitas | `compatibility_score` |
| Skill Match | `skill_match_score` |
| Pengalaman | `experience_match_score` |

**Acceptance Criteria:**

- Score grid tampil jika minimal satu job match ditemukan.
- Score diambil dari job match ranking pertama.
- Progress bar mengikuti nilai score dalam persen.

### FR-006 — Render Job Matches

Sistem harus menampilkan daftar pekerjaan yang cocok.

**Field yang digunakan:**

| UI | Response Field | Fallback |
|---|---|---|
| Job title | `job_title` | `Posisi Tidak Diketahui` |
| Company | `company` | `Perusahaan` |
| Score | `compatibility_score` | `—` |
| Matched skills | `matched_skills` | hidden |
| Skill gap | `skill_gap` | hidden |
| Required years | `required_years` | hidden |
| Candidate years | `candidate_years` | `0` |

### FR-007 — Render Career Coaching

Sistem harus menampilkan konten career coaching dengan Markdown renderer.

**Supported response keys:**

- `coaching`
- `career_coaching`
- `interview_questions`
- `coach`
- nested object dengan field `text`, `content`, `message`, `response`, `output`, atau `result`

### FR-008 — Render Full Report

Sistem harus menampilkan response lengkap pada tab Full Report.

**Acceptance Criteria:**

- Jika response berupa string Markdown, render sebagai Markdown.
- Jika response berupa object/array JSON, render sebagai formatted JSON di dalam `<pre>`.
- Semua HTML dari raw JSON harus di-escape.

### FR-009 — Reset Analisis

Sistem harus menyediakan tombol untuk memulai analisis baru.

**Acceptance Criteria:**

- File input dikosongkan.
- File chosen indicator disembunyikan.
- Submit button enabled.
- Form card tampil kembali.
- Results disembunyikan.
- Error disembunyikan.
- Score grid disembunyikan.
- Scroll kembali ke atas.

---

## 8. Backend / Workflow Requirements

MVP saat ini menggunakan n8n sebagai workflow orchestrator. Workflow harus menerima file CV, menjalankan proses AI, dan mengembalikan response JSON yang kompatibel dengan frontend.

### 8.1 Pipeline Backend

1. Receive webhook request.
2. Validate file.
3. Extract text from CV.
4. Remove or mask personal identifiable information.
5. Extract structured candidate profile.
6. Generate embedding dari profil kandidat.
7. Search lowongan paling relevan di Supabase Vector DB.
8. Hitung compatibility score.
9. Generate career coaching.
10. Return structured JSON.

### 8.2 Response Contract Utama

Backend disarankan mengembalikan response seperti berikut:

```json
{
  "analysis_id": "uuid-or-generated-id",
  "candidate_profile": {
    "skills": ["React", "TypeScript", "Node.js"],
    "total_experience_years": 2,
    "summary": "Frontend-focused software engineer with JavaScript ecosystem experience."
  },
  "job_matches": [
    {
      "job_id": "job-001",
      "job_title": "Frontend Engineer",
      "company": "Company A",
      "compatibility_score": 86,
      "skill_match_score": 90,
      "experience_match_score": 76,
      "matched_skills": ["React", "TypeScript"],
      "skill_gap": ["Testing", "GraphQL"],
      "required_years": 2,
      "candidate_years": 2,
      "reasoning": "Candidate has strong alignment with frontend stack."
    }
  ],
  "career_coaching": "## Rekomendasi Karier\nKamu cocok untuk posisi Frontend Engineer...",
  "interview_questions": [
    {
      "question": "Ceritakan pengalamanmu membangun UI kompleks dengan React.",
      "focus": "React problem solving",
      "star_guidance": {
        "situation": "Jelaskan konteks proyek.",
        "task": "Jelaskan tanggung jawabmu.",
        "action": "Jelaskan tindakan teknis yang kamu ambil.",
        "result": "Jelaskan hasil terukur."
      }
    }
  ],
  "raw_report": "Optional full text report"
}
```

### 8.3 Backward-Compatible Response Keys

Frontend MVP harus tetap menerima beberapa variasi key berikut agar kompatibel dengan output n8n yang belum stabil:

| Data | Primary Key | Alternative Keys |
|---|---|---|
| Job matches | `job_matches` | `matches`, `jobs`, `results`, `output` |
| Coaching | `career_coaching` | `coaching`, `coach`, `interview_questions` |
| Markdown text | `text` | `content`, `message`, `response`, `output`, `result` |

---

## 9. Scoring Requirement

### 9.1 Formula Default

```text
compatibility_score = (skill_match_score * 0.70) + (experience_match_score * 0.30)
```

### 9.2 Skill Match Score

```text
skill_match_score = matched_required_skills / total_required_skills * 100
```

### 9.3 Experience Match Score

| Kondisi | Score |
|---|---:|
| candidate_years >= required_years | 100 |
| candidate_years >= required_years * 0.75 | 70 |
| candidate_years >= required_years * 0.5 | 40 |
| candidate_years < required_years * 0.5 | 0 |
| required_years = 0 | 100 |

### 9.4 Ranking

- Backend harus mengurutkan `job_matches` dari skor tertinggi ke terendah.
- Frontend menggunakan elemen pertama sebagai sumber score overview.
- Minimal top 3 job matches dikembalikan jika tersedia.

---

## 10. Data Model MVP

Untuk MVP berbasis n8n, data tidak wajib dipersisten di aplikasi. Namun agar mudah dikembangkan ke platform fullstack, struktur berikut direkomendasikan.

### 10.1 `jobseekers`

```sql
CREATE TABLE jobseekers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 10.2 `users`

Jika sistem tetap menggunakan tabel `users`, role harus menggunakan `jobseeker`, bukan `user`.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'jobseeker'
    CHECK (role IN ('jobseeker', 'hrd', 'superadmin')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'suspended')),
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 10.3 `job_postings`

```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  title TEXT NOT NULL,
  company_name TEXT,
  description TEXT,
  required_skills TEXT[] NOT NULL,
  min_experience_years INTEGER DEFAULT 0,
  location TEXT,
  job_type TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'draft')),
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 10.4 `analysis_jobs`

```sql
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jobseeker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cv_storage_path TEXT,
  original_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 10.5 `analysis_results`

```sql
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_job_id UUID REFERENCES analysis_jobs(id) ON DELETE CASCADE,
  jobseeker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_profile JSONB,
  job_matches JSONB NOT NULL,
  career_coaching TEXT,
  interview_questions JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 11. Security & Privacy Requirements

### 11.1 CV Privacy

- CV berisi data sensitif dan tidak boleh disimpan publik.
- Untuk MVP n8n, file hanya boleh diproses untuk kebutuhan analisis.
- Jika file disimpan, gunakan private storage dan TTL.
- HRD tidak boleh melihat CV asli jobseeker.

### 11.2 PII Anonymization

Backend wajib melakukan masking untuk:

- Nama lengkap.
- Email.
- Nomor telepon.
- Alamat.
- URL profil pribadi.
- Nama perusahaan sebelumnya, jika laporan akan dilihat HRD.

Placeholder yang direkomendasikan:

- `[NAMA]`
- `[EMAIL]`
- `[TELEPON]`
- `[ALAMAT]`
- `[PERUSAHAAN]`

### 11.3 Client-Side Security

- Escape HTML saat menampilkan raw JSON.
- Jangan render raw HTML dari backend tanpa sanitization.
- Markdown harus dibatasi pada elemen aman.
- Jangan expose API key di frontend.
- Webhook URL public sebaiknya diganti dengan backend proxy pada production.

### 11.4 Production Recommendation

Untuk production, frontend tidak sebaiknya langsung memanggil webhook n8n public. Gunakan server endpoint internal:

```text
POST /api/cv/analyze
```

Endpoint tersebut bertugas:

- Validasi auth jika sudah ada login.
- Validasi file type dan size.
- Rate limiting.
- Forward request ke n8n.
- Menyembunyikan URL webhook asli.
- Logging request dan error.

---

## 12. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | MVP response ideal < 60 detik untuk CV normal |
| UX | Loading state wajib tampil selama analisis |
| Reliability | Error backend harus ditampilkan jelas ke jobseeker |
| Compatibility | Responsive untuk desktop dan mobile |
| Accessibility | Kontras warna dan focus state harus diperiksa ulang |
| Security | Webhook URL tidak boleh terekspos di production final |
| Privacy | PII harus dianonimkan sebelum ditampilkan ke pihak non-jobseeker |
| Maintainability | Response contract harus distandarkan agar frontend tidak banyak fallback |

---

## 13. Analytics & Event Tracking

Event yang direkomendasikan:

| Event | Trigger | Properties |
|---|---|---|
| `cv_file_selected` | Jobseeker memilih file | file_extension, file_size_kb |
| `cv_analysis_started` | Submit berhasil divalidasi | filename, timestamp |
| `cv_analysis_failed` | Webhook error | status_code, error_message |
| `cv_analysis_completed` | Hasil berhasil dirender | job_match_count, top_score |
| `tab_opened` | Jobseeker membuka tab hasil | tab_name |
| `analysis_reset` | Jobseeker klik analisis baru | previous_job_match_count |

---

## 14. Acceptance Criteria MVP End-to-End

MVP dianggap selesai jika:

- Jobseeker dapat mengunggah file CV dari browser.
- File yang dipilih tampil di UI.
- Submit tanpa file menampilkan error.
- Submit dengan file mengirim request ke webhook.
- Loading pipeline tampil saat request berjalan.
- Response sukses menampilkan halaman hasil.
- Jika response punya `job_matches`, UI menampilkan score dan job cards.
- Jika response punya `career_coaching`, UI menampilkan konten Markdown.
- Jika response tidak terstruktur, UI tetap menampilkan Full Report.
- Error network/backend ditampilkan ke jobseeker.
- Tombol reset mengembalikan aplikasi ke state awal.

---

## 15. Roadmap

### Phase 1 — Stabilize MVP

- Standarisasi response contract dari n8n.
- Tambahkan validasi file extension dan size di frontend.
- Tambahkan backend proxy untuk menyembunyikan webhook URL.
- Tambahkan telemetry event dasar.
- Tambahkan sanitization Markdown.

### Phase 2 — Persistence & Auth

- Implementasi login Google.
- Role default: `jobseeker`.
- Simpan analysis job dan result.
- Dashboard jobseeker untuk melihat riwayat analisis.
- Download report PDF.

### Phase 3 — HRD Portal

- Role `hrd` dengan approval `superadmin`.
- CRUD job postings.
- Embedding otomatis saat lowongan dibuat/diubah.
- Kandidat anonim berdasarkan job match.

### Phase 4 — Interview Coach

- Generate STAR interview questions.
- Chatbot simulasi interview.
- Feedback per komponen STAR.
- Resume session.

### Phase 5 — Admin & Monitoring

- Dashboard superadmin.
- Monitoring n8n workflow.
- AI cost tracking.
- Error rate tracking.
- Konfigurasi scoring weight.
- Audit log.

---

## 16. Open Questions

1. Apakah nama produk final tetap **CareerMatch**, **AI Career Match**, atau **CV Match Pro**?
2. Apakah MVP wajib tetap menggunakan n8n, atau akan segera dipindah ke backend TanStack Start?
3. Apakah file DOC perlu didukung penuh, atau hanya DOCX dan PDF?
4. Apakah job database berasal dari Supabase internal, scraped job data, atau input manual HRD?
5. Apakah output career coaching harus bahasa Indonesia, Inggris, atau mengikuti bahasa CV?
6. Apakah score harus ditampilkan sebagai integer atau decimal?
7. Berapa batas ukuran CV final: 5MB atau 10MB?
8. Apakah CV boleh disimpan, atau hanya diproses transient tanpa persistence?

---

## 17. Tech Stack

### 17.1 Frontend & Fullstack Framework

| Teknologi | Versi | Fungsi | Justifikasi |
|---|---|---|---|
| **TanStack Start** | Latest | Fullstack framework utama (SSR/RSC) | Type-safe, file-based routing, unified server dan client dalam satu project |
| **TanStack Router** | Latest | Client-side routing | Type-safe routes, loader pattern terintegrasi dengan server functions |
| **TanStack Query** | Latest | Server state management | Caching, polling status analisis, automatic invalidation |
| **React** | 19 | UI library | Ekosistem luas, kompatibel penuh dengan seluruh ekosistem TanStack |
| **Tailwind CSS** | v4 | Styling utility-first | Performa build optimal, konsisten di seluruh komponen |
| **TypeScript** | 5.x | Type safety end-to-end | Meminimalisir runtime error pada pipeline AI yang kompleks |

### 17.2 Autentikasi & Session Management

| Teknologi | Versi | Fungsi | Justifikasi |
|---|---|---|---|
| **Better Auth** | Latest | Session manager utama di lapisan aplikasi | Framework-agnostic, mendukung custom Supabase adapter, fleksibel untuk menambah provider OAuth baru |
| **Better Auth Google Plugin** | Latest | Integrasi Google OAuth 2.0 | Abstraksi OAuth flow yang clean, type-safe, dan mudah dikonfigurasi |
| **Supabase Auth** | Latest | OAuth provider (Google) | Menangani integrasi dengan Google, redirect, dan token management di sisi provider |

Strategi autentikasi menggunakan pendekatan hybrid: **Supabase Auth** sebagai OAuth provider, **Better Auth** sebagai session manager di lapisan aplikasi (HTTP-only cookie, token rotation, RBAC middleware).

**Alur login Google OAuth:**

1. User klik "Masuk dengan Google" → Better Auth initiate OAuth flow.
2. Google OAuth Consent Screen ditampilkan.
3. Callback ke `/api/auth/callback/google`.
4. Better Auth tukar code dengan access token, fetch profil Google.
5. Cek email di tabel `users`: jika baru dibuat, role default `jobseeker`.
6. Session disimpan ke tabel `sessions` di Supabase, HTTP-only cookie di-set.
7. Redirect ke dashboard sesuai role.

**Keamanan session:**

| Mekanisme | Detail |
|---|---|
| Cookie type | HTTP-only, Secure, SameSite=Strict |
| Session duration | 7 hari, auto-refresh jika < 1 hari tersisa |
| Token rotation | Aktif setiap request yang memperbarui session |
| Rate limiting login | Maks. 10 percobaan per IP per 15 menit |
| Force logout | Superadmin dapat invalidate semua session user dari panel admin |

### 17.3 Backend & AI

| Teknologi | Versi | Fungsi | Justifikasi |
|---|---|---|---|
| **TanStack Start Server Functions** | Latest | API layer internal | Type-safe end-to-end, tightly integrated dengan router |
| **n8n** | Latest | Workflow orchestrator pipeline AI (MVP) | Low-code, visual pipeline untuk Agent 1/2/3 dan integrasi AI |
| **OpenAI SDK** | Latest | Agent 1 (CV Analyzer), Agent 2 (Career Advisor), Agent 3 (Interview Prep) menggunakan GPT-4o | Kualitas tertinggi untuk analisis bahasa, anonymisasi, dan coaching naratif |
| **pdf-parse** | Latest | Ekstraksi teks dari file PDF | Ringan, tanpa external dependencies |
| **mammoth** | Latest | Ekstraksi teks dari file DOCX | Output teks/HTML bersih dari format Word |
| **@react-pdf/renderer** | Latest | Generate laporan hasil analisis ke format PDF | React-native approach, customizable layout |

### 17.4 Database & Storage

| Teknologi | Versi | Fungsi | Justifikasi |
|---|---|---|---|
| **Supabase** | Latest | PostgreSQL database utama | Managed, built-in Row Level Security, realtime support |
| **Supabase pgvector** | Latest | Vector similarity search untuk job matching | Native di PostgreSQL, tidak membutuhkan infrastruktur vector DB terpisah |
| **Supabase Storage** | Latest | Object storage untuk file CV dan laporan PDF | Terintegrasi dengan RLS Supabase, signed URL untuk akses private |

**Struktur bucket Supabase Storage:**

| Bucket | Akses | Isi | Retensi |
|---|---|---|---|
| `cv-uploads` | Private | File CV asli jobseeker | 30 hari |
| `analysis-reports` | Private (signed URL) | Laporan PDF hasil analisis | 90 hari |

Path file `cv-uploads`: `{jobseeker_id}/{timestamp}_{filename}.{ext}`
Path file `analysis-reports`: `{jobseeker_id}/{analysis_job_id}_report.pdf`

### 17.5 Testing & DevOps

| Teknologi | Fungsi |
|---|---|
| **Vitest** | Unit testing dan integration testing |
| **Playwright** | End-to-end testing seluruh flow per role |
| **Sentry** | Error monitoring dan performance tracking di production |
| **Vercel** | Production deployment (edge-ready, compatible dengan TanStack Start) |
| **GitHub Actions** | CI/CD pipeline: lint, test, build, deploy otomatis |

### 17.6 Ringkasan Keputusan Tech Stack

| Kategori | Pilihan | Alasan Utama |
|---|---|---|
| Fullstack framework | TanStack Start | Type-safe, unified server+client, ekosistem TanStack yang konsisten |
| Session management | Better Auth | Fleksibel, Supabase adapter, mudah tambah OAuth provider baru |
| OAuth provider | Google via Supabase Auth + Better Auth | Login mudah tanpa password, familiar untuk end user |
| Database | Supabase PostgreSQL | Managed, pgvector built-in, RLS untuk keamanan multi-role |
| Object storage | Supabase Storage | Terintegrasi RLS, tidak perlu vendor storage terpisah |
| AI orchestration (MVP) | n8n | Iterasi cepat tanpa kode tambahan; migrasi ke server functions di fase lanjutan |
| AI model | GPT-4o (OpenAI) | Kualitas terbaik untuk analisis CV kompleks dan coaching naratif |
| Styling | Tailwind CSS v4 | Performa, konsistensi, dan ekosistem komponen yang luas |

---

## 18. Engineering Notes

- Prototype saat ini mengizinkan `.pdf`, `.doc`, `.docx`, dan teks UI menyebut maksimum 10MB. PRD lama menyebut PDF/DOCX maksimum 5MB. Perlu keputusan final agar frontend dan backend konsisten.
- Prototype saat ini langsung memanggil webhook n8n dari browser. Ini cepat untuk MVP, tetapi kurang ideal untuk production karena URL webhook terekspos.
- Frontend sudah cukup defensif terhadap format response berbeda. Namun untuk maintainability, backend tetap harus distandarkan.
- Semua referensi role `user` dari PRD lama harus diganti menjadi `jobseeker`, termasuk enum database, route guard, policy, dokumentasi, dan UI copy.
- Fitur HRD, superadmin, auth, STAR chatbot, dan PDF report sebaiknya tidak dimasukkan ke definisi MVP kecuali memang sudah akan dibangun pada sprint yang sama.
