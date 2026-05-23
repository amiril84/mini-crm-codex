# Deployment Plan: Mini CRM Web Application

Dokumen ini berisi panduan, strategi, dan langkah-langkah praktis untuk mempublikasikan (*deploy*) aplikasi Mini CRM agar bisa diakses secara publik di internet.

## Tantangan Arsitektur (Next.js + SQLite)
Tech stack yang dipilih dalam Implementation Plan menggunakan **SQLite** (berupa file lokal `dev.db`). Jika aplikasi ini di-deploy ke layanan *Serverless* populer dan gratis seperti Vercel atau Netlify, **file database SQLite akan terhapus (*reset*)** setiap kali *server* tertidur (*sleep*) atau di-*rebuild*.

Oleh karena itu, berikut adalah **2 Opsi Deployment** yang sangat terjangkau (bahkan 100% gratis) dan mudah dilakukan.

---

## OPSI A: "The Serverless Way" (Paling Mudah, Paling Disarankan, 100% Gratis)
Solusi terbaik adalah mempertahankan *frontend* di *serverless*, namun memindahkan lokasi database SQLite lokal ke Cloud Database gratis.
*   **Hosting Aplikasi (Frontend & API):** **Vercel** (Gratis, optimasi paling sempurna untuk Next.js).
*   **Hosting Database:** **Turso** (Database SQLite versi Cloud/Edge yang sangat cepat & gratis) atau **Supabase/Neon** (PostgreSQL yang murah/gratis).

### Langkah-Langkah Eksekusi (Opsi A):
1.  **Persiapan Repositori (GitHub):**
    *   Pastikan aplikasi sudah berjalan lancar di lokal.
    *   *Commit* dan *Push* seluruh *source code* ke *repository* GitHub Anda (Public atau Private).
2.  **Pembuatan Database Cloud (Contoh via Turso):**
    *   Buka [turso.tech](https://turso.tech) dan buat akun (Gratis).
    *   Buat database baru via *dashboard* atau Turso CLI.
    *   Dapatkan **Database URL** dan **Auth Token**.
3.  **Penyesuaian Kode oleh AI Developer:**
    *   Perintahkan AI untuk mengganti *provider* database (misal jika tadinya menggunakan PostgreSQL) atau memasang *driver* Prisma khusus Turso (`@prisma/adapter-libsql`).
    *   Jalankan migrasi di komputer lokal untuk membentuk tabel di Cloud Database (`npx prisma db push`).
4.  **Proses Deploy ke Vercel:**
    *   Buka [vercel.com](https://vercel.com) dan masuk menggunakan GitHub.
    *   Klik **"Add New Project"** lalu impor *repository* CRM Anda.
    *   Buka bagian **Environment Variables**, tambahkan:
        *   `DATABASE_URL` (Isi dengan URL dari Turso/Supabase).
        *   `DATABASE_AUTH_TOKEN` (Jika menggunakan Turso).
    *   Klik **Deploy**. Vercel akan mem-build aplikasi dan memberikan tautan domain gratis (misal: `mini-crm.vercel.app`).

---

## OPSI B: "The Persistent VPS/Container" (Tetap Memakai File SQLite Lokal)
Jika Anda mutlak ingin menggunakan file `.db` di dalam folder proyek (SQLite murni tanpa Cloud Database eksternal), Anda tidak bisa menggunakan Vercel. Anda harus menyewa *Virtual Private Server* (VPS) atau layanan *Container* yang memiliki disk permanen (*Persistent Volume*).
*   **Hosting:** **Render.com** (Ada *free tier*, tapi fitur *Persistent Disk* sangat murah sekitar $1/bulan), **Fly.io** (Sangat murah, ideal untuk SQLite), atau **Hetzner/DigitalOcean Droplet** (Mulai $4/bulan).

### Langkah-Langkah Eksekusi (Opsi B via Render.com):
1.  **Persiapan File Database:**
    *   Masukkan file `dev.db` ke dalam `.gitignore` agar database *dummy* dari laptop Anda tidak terbawa ke GitHub. *Push* kode Anda ke GitHub.
2.  **Setup di Render.com:**
    *   Masuk ke [render.com](https://render.com) dan buat **"New Web Service"**.
    *   Hubungkan *repository* GitHub Anda.
    *   Pilih lingkungan: `Node`.
    *   Isi *Build Command*: `npm install && npx prisma generate && npm run build`
    *   Isi *Start Command*: `npm run start`
3.  **Setup Persistent Disk (Wajib):**
    *   Di bagian pengaturan layanan Render, cari **"Disks"**.
    *   Tambahkan *Disk* baru. Beri nama (misal: `sqlite-data`) dan atur *Mount Path* ke folder penyimpanan (contoh: `/opt/render/project/src/prisma/data`).
    *   Tambahkan *Environment Variable*: `DATABASE_URL="file:/opt/render/project/src/prisma/data/dev.db"`.
4.  **Menjalankan Migrasi di Server:**
    *   Lakukan *Deploy*. Setelah sukses *deploy* pertama, masuk ke fitur **"Shell"** (Terminal) di *dashboard* Render.
    *   Ketik perintah `npx prisma db push` untuk menciptakan tabel kosong di dalam disk permanen Render.
    *   Ketik perintah `npm run seed` (jika ada) untuk memasukkan data awal. Aplikasi siap digunakan tanpa takut data hilang!

---

## Saran Terakhir untuk Eksekusi Bersama AI
Jika Anda sudah mencapai **Fase 5** dari *Implementation Plan*, Anda dapat memberikan *prompt* (perintah) ini kepada AI Developer:

> *"AI, semua fitur telah selesai dan diuji. Sekarang saya ingin melakukan deployment menggunakan **[sebutkan Opsi A atau Opsi B]** dari Deployment Plan. Tolong pandu saya mengatur Environment Variables, menyesuaikan file `schema.prisma` jika diperlukan, dan memberikan instruksi command-line untuk menghubungkan proyek ini ke [Sebutkan Platform: Vercel/Render]."*
