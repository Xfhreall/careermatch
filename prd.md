# Product Requirements Document (PRD)
## CareerMatch — AI Job Matching Agent

---

| Atribut | Detail |
|---|---|
| Versi | 2.0.0 — Product Implementation |
| Status | Implemented dan terintegrasi |
| Tanggal | 16 Mei 2026 |
| Produk | CareerMatch / AI Career Match |
| Fokus Versi | Multi-role Web App: Dashboard Jobseeker → AI Job Matching → Career Coaching → HRD & Superadmin Operations |
| Role Utama | `jobseeker`, `hrd`, `superadmin` |
| Integrasi Saat Ini | Better Auth Google, n8n Webhook, GPT-4o, Supabase Postgres/Storage/Vector DB |
| Prioritas | P0 — Core Matching Experience |

---

## 1. Ringkasan Eksekutif

CareerMatch adalah aplikasi web berbasis AI yang membantu jobseeker menemukan posisi pekerjaan yang paling sesuai berdasarkan isi CV. Jobseeker mengunggah CV dalam format PDF/DOC/DOCX, lalu sistem menjalankan pipeline AI untuk membaca CV, melakukan anonimisasi data pribadi, mencocokkan profil dengan database lowongan, menghitung skor kompatibilitas, dan memberikan saran karier yang dapat ditindaklanjuti.

Versi awal berupa single-page prototype dengan integrasi langsung ke webhook n8n. Versi PRD ini menyelaraskan kebutuhan produk dengan aplikasi multi-role yang sudah memakai dashboard jobseeker, HRD, superadmin, Better Auth Google, endpoint proxy, dan hasil analisis tersimpan di Supabase.

### Nilai Utama Produk

- **Untuk jobseeker:** mengetahui lowongan yang paling cocok, skor kecocokan, skill yang sudah sesuai, skill gap, dan rekomendasi karier.
- **Untuk HRD:** mengelola lowongan dan melihat kandidat anonim berdasarkan skor kecocokan.
- **Untuk superadmin:** mengelola user, lowongan, workflow AI, monitoring, dan konfigurasi sistem.

---

## 2. Implementasi dari Prototype

Prototype `ai-job-matching.html` direalisasikan ke aplikasi multi-route dengan flow utama berikut:

1. Jobseeker membuka landing page CareerMatch.
2. User menekan tombol **Login** untuk masuk via Google menggunakan Better Auth.
3. Setelah session terbaca, aplikasi mengecek role dan mengarahkan jobseeker ke dashboard jobseeker.
4. Jobseeker mengunggah file CV melalui upload zone di dashboard.
5. UI menampilkan nama file dan ukuran file.
6. Jobseeker menekan tombol **Analisis CV**.
7. Frontend memvalidasi bahwa file sudah dipilih.
8. Frontend menampilkan loading state dengan lima tahap pipeline:
   - Membaca dan mengekstrak teks CV
   - Anonimisasi data PII
   - Mencari pekerjaan yang cocok di database
   - Menghitung skor kompatibilitas
   - Menyiapkan saran karier dan pertanyaan interview
9. Frontend mengirim `FormData` ke server endpoint internal.
10. Server menyimpan file CV ke private Supabase Storage dan membuat `analysis_jobs`.
11. Backend/workflow AI mengembalikan JSON atau Markdown.
12. Server menormalisasi dan menyimpan `analysis_results` ke Supabase Postgres.
13. Frontend menampilkan score cards, daftar pekerjaan, coaching, dan Full Report.
14. Jobseeker dapat membuka ulang hasil dari riwayat analisis atau menekan **Analisis CV Baru**.

### Observasi Engineering

Implementasi saat ini memakai aplikasi multi-route dengan dashboard jobseeker, HRD, dan superadmin. Analisis CV dilakukan dari dashboard jobseeker, file CV tersimpan private di Supabase Storage, hasil tersimpan di Supabase Postgres, dan setiap role memiliki permukaan fitur sesuai matriks PRD.

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

**Hak akses:**

- Mengakses landing page.
- Mengunggah CV.
- Melihat hasil analisis milik sendiri.
- Melakukan reset untuk analisis baru.
- Mengakses dashboard role.
- Melihat riwayat analisis.
- Menyimpan hasil analisis.
- Mengekspor report melalui aksi simpan PDF/print browser.
- Mengakses simulasi interview STAR.

### 4.2 Role: `hrd`

Role untuk recruiter/perusahaan.

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

## 5. Scope Produk

### 5.1 Core Jobseeker Flow

- Landing page CareerMatch.
- Dashboard jobseeker sebagai pusat analisis CV.
- Upload CV via click atau drag-and-drop.
- Dukungan file PDF, DOC, dan DOCX.
- Validasi minimal file wajib dipilih.
- Pengiriman file ke endpoint internal menggunakan `multipart/form-data`.
- Penyimpanan file CV ke private Supabase Storage.
- Penyimpanan analysis job dan result ke Supabase Postgres.
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
- Reset flow untuk analisis baru dan hapus hasil dari riwayat user.
- Riwayat analisis pada dashboard jobseeker.
- Export report melalui aksi simpan PDF/print browser.

### 5.2 Role Dashboard Features

- Dashboard HRD untuk kelola lowongan, required skills, minimum experience, kandidat anonim, dan export laporan kandidat.
- Dashboard superadmin untuk kelola user, approve/reject HRD, kelola lowongan, monitoring workflow, AI cost, latency, error rate, scoring weight, dan model AI.
- STAR interview coach untuk simulasi jawaban, feedback per komponen STAR, dan resume sesi latihan.
- Struktur auth dan role tetap menggunakan enum `jobseeker`, `hrd`, dan `superadmin`.

---

## 6. User Journey Produk

### 6.1 Happy Path

1. Jobseeker membuka halaman utama.
2. Jobseeker membaca value proposition.
3. Jobseeker login via Google.
4. Sistem mengecek role dan mengarahkan ke dashboard jobseeker.
5. Jobseeker memilih atau drag-and-drop CV di dashboard.
6. Sistem menampilkan file yang dipilih.
7. Jobseeker klik tombol analisis.
8. Sistem menampilkan loading pipeline.
9. Sistem mengirim file ke endpoint internal.
10. Server memvalidasi session/role, menyimpan file ke Supabase Storage, dan membuat analysis job.
11. Workflow AI memproses file.
12. Sistem menerima response, menormalisasi payload, dan menyimpan hasil ke Supabase Postgres.
13. UI menampilkan hasil analisis.
14. Jobseeker membuka tab:
    - Job Matches.
    - Career Coach.
    - Full Report.
15. Jobseeker dapat membuka ulang hasil dari riwayat atau memulai analisis baru.

### 6.2 Empty File Path

1. Jobseeker klik tombol analisis tanpa memilih file.
2. Sistem menampilkan error: `Silakan upload file CV terlebih dahulu.`
3. Sistem tidak mengirim request ke webhook.

### 6.3 Backend Error Path

1. Jobseeker sudah memilih file.
2. Sistem mengirim file ke endpoint internal.
3. Webhook mengembalikan non-2xx response atau koneksi gagal.
4. Analysis job ditandai `failed`.
5. Sistem menyembunyikan loading.
6. Tombol submit aktif kembali.
7. Sistem menampilkan error: `Gagal terhubung ke server: {message}`.

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

### FR-003 — Submit ke Endpoint Internal

Sistem harus mengirim file CV ke endpoint internal menggunakan `POST multipart/form-data`. Endpoint internal memvalidasi session/role, menyimpan CV ke Supabase Storage, membuat `analysis_jobs`, meneruskan request ke webhook n8n dari server, lalu menyimpan hasil ke `analysis_results`.

**Request Contract:**

```http
POST /api/cv/analyze
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

- Result aktif dihapus dari database untuk user tersebut.
- User diarahkan kembali ke dashboard jobseeker.
- Riwayat analisis di-refresh.
- Upload form siap digunakan untuk analisis berikutnya.

---

## 8. Backend / Workflow Requirements

Aplikasi menggunakan n8n sebagai workflow orchestrator. Workflow menerima file CV, menjalankan proses AI, dan mengembalikan response JSON yang kompatibel dengan frontend.

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

Backend mengembalikan response seperti berikut:

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

Frontend menerima beberapa variasi key berikut agar kompatibel dengan output n8n yang belum stabil:

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

## 10. Data Model

Database produksi memakai Supabase Postgres. Schema terimplementasi pada `supabase/migrations/20260518180000_careermatch_production.sql` dan data awal pada `supabase/seed.sql`.

### 10.1 Better Auth Tables

Better Auth memakai tabel Postgres berikut agar Google OAuth, account linking, verification, dan session tersimpan persisten:

- `users` — id Better Auth, email, `email_verified`, name, `avatar_url`, `role`, `status`, `company_id`.
- `sessions` — token session, expiry, user agent, IP, `user_id`.
- `accounts` — provider account Google, OAuth token terenkripsi oleh Better Auth, `user_id`.
- `verifications` — token verifikasi dan OAuth state saat strategi database aktif.

Role user wajib memakai enum string:

```text
jobseeker | hrd | superadmin
```

### 10.2 Core App Tables

| Table | Fungsi |
|---|---|
| `companies` | Profil perusahaan HRD dan status approval |
| `job_vacancies` | Lowongan, required skills, minimum experience, status embedding, dan vector `embedding(1536)` |
| `analysis_jobs` | Status proses upload/analisis CV per jobseeker |
| `analysis_results` | Hasil normalisasi analisis, job matches, skill gap, coaching, raw response |
| `anonymous_candidate_matches` | Kandidat anonim yang terlihat oleh HRD |
| `hrd_approval_requests` | Queue approval/reject registrasi HRD |
| `workflow_metrics` | Monitoring n8n, AI cost, error rate, dan approval queue |
| `scoring_configs` | Bobot scoring, default 70% skill dan 30% experience |
| `model_configs` | Konfigurasi agent/model AI |
| `audit_events` | Event admin, workflow, scoring, dan approval |

### 10.3 Storage Buckets

| Bucket | Akses | Isi |
|---|---|---|
| `cv-uploads` | Private, service role only | File CV asli jobseeker |
| `analysis-reports` | Private, service role only | Laporan hasil analisis |

### 10.4 Security Model

- RLS aktif untuk seluruh tabel aplikasi.
- Client browser tidak memanggil Supabase service role.
- Server route menggunakan `SUPABASE_SERVICE_ROLE_KEY` hanya di server.
- File CV asli tidak pernah diberikan ke HRD.

---

## 11. Security & Privacy Requirements

### 11.1 CV Privacy

- CV berisi data sensitif dan tidak boleh disimpan publik.
- Untuk alur n8n, file hanya boleh diproses untuk kebutuhan analisis.
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
- Webhook URL public diganti dengan backend proxy pada production.

### 11.4 Production Recommendation

Untuk production, frontend memanggil server endpoint internal:

```text
POST /api/cv/analyze
```

Endpoint tersebut bertugas:

- Validasi role/session request.
- Validasi file type dan size.
- Rate limiting.
- Forward request ke n8n.
- Menyembunyikan URL webhook asli.
- Logging request dan error.

---

## 12. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | Response ideal < 60 detik untuk CV normal |
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

## 14. Acceptance Criteria End-to-End

Produk dianggap selesai jika:

- Navbar hanya berisi logo, menu `home/about/features/contact`, dan tombol login.
- Login Google berjalan lewat Better Auth.
- Setelah login, user diarahkan ke dashboard sesuai role.
- Jobseeker dapat mengunggah file CV dari browser.
- File yang dipilih tampil di UI.
- Submit tanpa file menampilkan error.
- Submit dengan file mengirim request ke endpoint internal.
- Endpoint internal menyimpan CV ke Supabase Storage.
- Endpoint internal menyimpan analysis job/result ke Supabase Postgres.
- Loading pipeline tampil saat request berjalan.
- Response sukses menampilkan halaman hasil.
- Jika response punya `job_matches`, UI menampilkan score dan job cards.
- Jika response punya `career_coaching`, UI menampilkan konten Markdown.
- Jika response tidak terstruktur, UI tetap menampilkan Full Report.
- Error network/backend ditampilkan ke jobseeker.
- Tombol reset menghapus result user dan kembali ke dashboard.
- HRD dapat menambah lowongan, refresh embedding, melihat kandidat anonim, dan export laporan.
- Superadmin dapat approve/reject HRD, melihat user/job/monitoring/scoring/model/audit.

---

## 15. Implementation Status

### 15.1 Core Matching Experience

- Response contract dari n8n distandarkan melalui normalizer frontend.
- Validasi file extension dan size tersedia di frontend dan server endpoint.
- Backend proxy `/api/cv/analyze` menyembunyikan webhook URL dari browser.
- Telemetry event dasar tersedia.
- Markdown dan raw report dirender secara aman.

### 15.2 Jobseeker Dashboard

- Role default: `jobseeker`.
- Upload CV dilakukan dari dashboard jobseeker.
- CV tersimpan private di Supabase Storage.
- Analysis job dan result tersimpan di Supabase Postgres.
- Riwayat analisis tampil di dashboard jobseeker.
- Report dapat diekspor melalui aksi simpan PDF/print browser.

### 15.3 HRD Dashboard

- Role `hrd` tersedia dalam role matrix.
- Lowongan dapat ditambahkan ke Supabase dari dashboard HRD.
- Required skills dan minimum years tampil per lowongan.
- Embedding status dapat di-refresh.
- Kandidat anonim tampil dari database berdasarkan job match dan dapat diekspor.

### 15.4 Interview Coach

- STAR interview questions tampil sebagai prompt latihan.
- Simulasi interview menerima jawaban kandidat.
- Feedback diberikan per kelengkapan komponen STAR.
- Transcript sesi tersimpan di layar selama latihan.

### 15.5 Admin & Monitoring

- Dashboard superadmin tersedia.
- Superadmin dapat approve/reject registrasi HRD dan update database.
- Workflow health, AI cost, error rate, dan HRD approval queue tampil dari database.
- Scoring weight mengikuti 70% skill match dan 30% experience match.
- Model AI dan audit log tampil pada console superadmin.

---

## 16. Product Decisions

1. Nama produk final: **CareerMatch**.
2. Endpoint analisis CV: browser memanggil `/api/cv/analyze`, server menyimpan CV/result ke Supabase dan meneruskan file ke n8n.
3. Format file CV: PDF, DOC, dan DOCX.
4. Job database: Supabase Postgres + pgvector, dengan input HRD sebagai sumber lowongan.
5. Bahasa career coaching: mengikuti response backend, UI utama bahasa Indonesia.
6. Tampilan score: integer percent agar mudah dipindai.
7. Batas ukuran CV: 10MB.
8. Privasi CV: CV asli tersimpan private untuk analisis dan tidak ditampilkan ke HRD.

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
| **Better Auth** | 1.6.x | Session manager dan OAuth handler | Terintegrasi dengan TanStack Start |
| **Better Auth Google Provider** | 1.6.x | Login Google | Mendukung `signIn.social({ provider: "google" })` |
| **TanStack Start Cookies Plugin** | 1.6.x | Sinkronisasi cookie auth di TanStack Start | Cookie OAuth/session diset lewat handler framework |
| **Postgres session tables** | Better Auth + Supabase | Session dan account OAuth persisten | Cocok untuk production multi-role dengan audit dan role redirect |

**Alur login dan role redirect:**

1. User klik tombol **Login** pada navbar.
2. Frontend memanggil `authClient.signIn.social({ provider: "google" })`.
3. Better Auth menjalankan OAuth Google melalui `/api/auth/*`.
4. Callback Google kembali ke aplikasi.
5. Aplikasi membaca session Better Auth dan mengambil `user.role`.
6. Jika role `jobseeker`, redirect ke `/jobseeker/dashboard`.
7. Jika role `hrd`, redirect ke `/hrd/portal`.
8. Jika role `superadmin`, redirect ke `/superadmin/monitoring`.

**Environment auth:**

| Variable | Fungsi |
|---|---|
| `BETTER_AUTH_URL` | Base URL aplikasi, contoh `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Secret minimal 32 karakter untuk cookie/session |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `DATABASE_URL` | Connection string Postgres untuk Better Auth |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key untuk database dan storage |
| `SUPABASE_ANON_KEY` | Public anon key jika dibutuhkan client Supabase |

### 17.3 Backend & AI

| Teknologi | Versi | Fungsi | Justifikasi |
|---|---|---|---|
| **TanStack Start Server Functions** | Latest | API layer internal | Type-safe end-to-end, tightly integrated dengan router |
| **n8n** | Latest | Workflow orchestrator pipeline AI | Low-code, visual pipeline untuk Agent 1/2/3 dan integrasi AI |
| **OpenAI GPT-4o** | Latest | Agent 1 (CV Analyzer), Agent 2 (Career Advisor), Agent 3 (Interview Prep) | Kualitas tinggi untuk analisis bahasa, anonymisasi, dan coaching naratif |
| **n8n extraction nodes** | Latest | Ekstraksi teks PDF/DOC/DOCX | Ekstraksi berjalan di workflow backend |
| **Browser print dialog** | Web API | Simpan report sebagai PDF | Tidak menambah dependency generator PDF di frontend |

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
| **TypeScript** | Typecheck end-to-end |
| **Biome** | Lint dan format |
| **Vite build** | Verifikasi production bundle |
| **Nitro Cloudflare preset** | Build target server |

### 17.6 Ringkasan Keputusan Tech Stack

| Kategori | Pilihan | Alasan Utama |
|---|---|---|
| Fullstack framework | TanStack Start | Type-safe, unified server+client, ekosistem TanStack yang konsisten |
| Session management | Better Auth | OAuth Google dan session cookie |
| OAuth provider | Google via Better Auth | Login familiar dan callback standar `/api/auth/callback/google` |
| Database | Supabase PostgreSQL | Managed, pgvector built-in, RLS untuk keamanan multi-role |
| Object storage | Supabase Storage | Terintegrasi RLS untuk private CV/report saat backend workflow menyimpan file |
| AI orchestration | n8n + TanStack server route | Iterasi cepat melalui workflow AI dengan proxy internal aplikasi |
| AI model | GPT-4o (OpenAI) | Kualitas terbaik untuk analisis CV kompleks dan coaching naratif |
| Styling | Tailwind CSS v4 | Performa, konsistensi, dan ekosistem komponen yang luas |

---

## 18. Engineering Notes

- Aplikasi mengizinkan `.pdf`, `.doc`, `.docx`, dan batas maksimum 10MB.
- Browser memanggil endpoint internal `/api/cv/analyze`; URL webhook n8n tetap di server.
- Endpoint analisis memvalidasi session Better Auth, menyimpan file ke Supabase Storage, dan menyimpan result ke Supabase Postgres.
- Frontend tetap defensif terhadap format response berbeda. Backend tetap mengembalikan contract terstruktur.
- Semua referensi role memakai `jobseeker`, `hrd`, dan `superadmin`, termasuk enum database, route guard, policy, dokumentasi, dan UI copy.
- Fitur HRD, superadmin, auth, STAR coach, dan report export masuk definisi produk dan tampil sebagai dashboard role.
