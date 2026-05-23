# Koleksi Prompt untuk AI Developer (Mini CRM)

Dokumen ini berisi sekumpulan perintah (*prompts*) yang sudah diracik secara spesifik agar Anda tinggal melakukan *copy-paste* ke antarmuka obrolan (chat) model AI Developer pilihan Anda. Ikuti urutan ini dari awal hingga akhir untuk memastikan proses pengembangan berjalan sesuai dengan dokumen *Implementation Plan*.

---

## 1. TAHAP PERSIAPAN & FASE 1 (Setup & Layout)
**Kapan dipakai:** Saat pertama kali memulai proyek baru dengan AI Developer.
**Instruksi:** Salin teks di bawah ini dan tempelkan di obrolan AI. Pastikan Anda sudah memberikan akses ke dokumen PRD, Implementation Plan, dan Deployment Plan kepada AI tersebut.

```text
Halo AI, kita akan membuat aplikasi "Mini CRM" berbasis Next.js dan SQLite. 
Tolong baca dan pahami dokumen `PRD_Mini_CRM.md` dan `Implementation_Plan_CRM.md` yang ada di workspace/folder ini secara teliti.

Tugas Anda sekarang: 
Laksanakan HANYA pekerjaan "Fase 1: Setup Proyek, Database SQLite, & Layout Dasar" yang ada di Implementation Plan. 
1. Lakukan instalasi framework dan konfigurasi database Prisma SQLite.
2. Buat file `schema.prisma` berdasarkan PRD dan jalankan `seed.ts`.
3. Buat Layout dasar (Sidebar dan TopBar).
4. Buat skrip otomatis `fase1.spec.ts` menggunakan Playwright/Jest untuk memenuhi Acceptance Criteria Fase 1.

PENTING: Jangan membuat modul lain dulu. Jika pengujian otomatis untuk Fase 1 sudah PASS, BERHENTI dan laporkan ke saya agar saya bisa melakukan pengujian manual. Tunggu instruksi saya selanjutnya!

Gunakan mcp context7 untuk dokumentasi library coding terbaru
Gunakan mcp playwright untuk melakukan test otomatis
```

---

## 2. PROMPT TRANSISI (Dipakai untuk Melanjutkan ke Fase 2, 3, 4, 5)
**Kapan dipakai:** Setiap kali Anda telah selesai melakukan pengujian manual di satu fase (misal Fase 1) dan merasa puas tanpa ada *bug*, gunakan prompt ini untuk menyuruh AI maju ke fase selanjutnya.
**Instruksi:** Ganti teks dalam kurung siku `[X]` dan `[Y]` sesuai nomor fase.

```text
Kerja bagus! Saya sudah melakukan pengujian manual untuk Fase [1] dan semuanya berjalan sempurna sesuai panduan.

Sekarang, silakan lanjut eksekusi "Fase [2]" seperti yang diinstruksikan dalam `Implementation_Plan_CRM.md`.
Tugas Anda:
1. Tulis kode aplikasinya.
2. Buat skrip testing otomatis untuk Fase [2] sesuai Acceptance Criteria, lalu jalankan.
3. Setelah semuanya PASS, segera STOP dan lapor ke saya untuk uji coba manual selanjutnya. Jangan bablas ke Fase berikutnya!
```

---

## 3. PROMPT KHUSUS: REVISI & PERBAIKAN BUG
**Kapan dipakai:** Jika saat pengujian otomatis gagal (FAILED), atau saat Anda melakukan uji coba manual ternyata menemukan *bug*/kerusakan (misalnya tombol tidak merespon, UI berantakan, salah kalkulasi total value di Kanban).

```text
Tunggu dulu, saya menemukan masalah saat pengujian manual di fase ini.
Detail masalahnya: [JELASKAN SECARA SINGKAT MISAL: Saat saya drag kartu Deal dari Qualification ke Proposal, Total Value uangnya malah bertambah dua-duanya, tidak berkurang di kolom awal].
Tolong perbaiki bug ini sekarang. Setelah diperbaiki, tolong perbarui juga skrip pengujian otomatis (E2E) agar bug semacam ini bisa dicegah ke depannya. Lapor lagi jika perbaikannya sudah selesai.
```

---

## 4. TAHAP FASE 4 KHUSUS (Kanban Board)
**Kapan dipakai:** Karena Fase 4 (Deals Kanban) sangat kompleks, terkadang AI perlu ditegaskan kembali instruksinya saat Anda memberikan "Prompt Transisi" ke Fase 4. Gabungkan prompt ini dengan Prompt Transisi.

```text
Sekarang kerjakan Fase 4 (Sales Pipeline Deals Kanban). 
Mohon berikan perhatian ekstra pada Fungsionalitas Kritis: Angka "Total Value" di atas kolom tahapan WAJIB langsung berubah secara otomatis (Optimistic Update) begitu mouse dilepas (Drop) saat memindahkan kartu Deal. Gunakan library dnd-kit atau @hello-pangea/dnd. Pastikan skrip Playwright (fase4.spec.ts) Anda benar-benar menguji pergerakan drag and drop ini secara presisi!
```

---

## 5. PROMPT KHUSUS: GIT COMMIT & PUSH
**Kapan dipakai:** Sangat disarankan untuk digunakan setiap kali sebuah fase telah selesai dan lulus uji coba manual dengan sukses.
**Instruksi:** Pastikan repository Git sudah diinisialisasi di folder proyek lokal Anda.

```text
Tolong bantu saya mengamankan kode (Version Control). 
Jalankan perintah Git untuk menambahkan perubahan (`git add .`), membuat commit (`git commit -m "..."`) dengan pesan jelas yang merangkum fitur apa saja yang baru Anda bangun di fase ini, dan lakukan push (`git push`) kode terbaru ini ke repository. Lapor ke saya kalau sudah berhasil!
```

---

## 6. TAHAP DOKUMENTASI PROYEK (Sebelum Rilis)
**Kapan dipakai:** Setelah seluruh Fase (1-5) selesai dikerjakan dan diuji, tepat **sebelum** melakukan deployment.
**Instruksi:** Bertujuan agar *source code* Anda ramah untuk *maintenance* jangka panjang.

```text
Aplikasi kita sudah hampir siap rilis. Sebelum itu, tolong bantu saya merapikan dokumentasi proyek.
1. Tambahkan komentar (*code comments*) yang deskriptif pada fungsi-fungsi krusial (terutama logika hitungan matematika di Kanban Board dan query database yang kompleks).
2. Buatkan file `README.md` yang bagus. Isinya harus mencakup: Nama Aplikasi, Deskripsi Fitur, Tech Stack, Cara Instalasi Lokal (cara setup Prisma/SQLite), dan Cara Menjalankan Test Otomatis.
Beri tahu saya jika dokumentasinya sudah siap!
```

---

## 7. TAHAP DEPLOYMENT (Rilis ke Publik)
**Kapan dipakai:** Setelah tahap pembuatan Dokumentasi selesai.
**Instruksi:** Tentukan Opsi mana yang Anda pilih dari file `Deployment_Plan_CRM.md` (Contoh ini memakai Opsi A).

```text
Luar biasa! Dokumentasi beres, aplikasi pun berjalan sempurna di lokal.

Sekarang, mari kita merilisnya (Deployment). 
Tolong baca dokumen `Deployment_Plan_CRM.md`. Kita akan melakukan deployment menggunakan "OPSI A" (Hosting Vercel dengan Database Cloud).
Tolong pandu saya langkah-langkah *command-line* apa saja yang perlu saya jalankan untuk menyesuaikan konfigurasi Prisma SQLite lokal ini agar terkoneksi ke Database Cloud, serta bantu siapkan instruksi *Environment Variable* untuk Vercel. Mari eksekusi!
```
