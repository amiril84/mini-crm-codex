# Implementation Plan: Mini CRM Web Application

Dokumen ini adalah panduan eksekusi bertahap (High-Level Implementation Plan) untuk mengembangkan Mini CRM berdasarkan PRD. Rencana ini dirancang khusus agar Model AI (Developer) dapat melakukan pengembangan secara modular, terstruktur, dan meminimalisir *error*.

**🚨 ATURAN KRITIS UNTUK AI DEVELOPER 🚨**
1. Kerjakan proyek ini secara bertahap (Fase per Fase).
2. Di akhir setiap fase, Anda **DIWAJIBKAN** menulis dan menjalankan skrip *automated testing* (menggunakan Playwright/Jest) berdasarkan *Acceptance Criteria* yang ditetapkan dan memastikan seluruhnya berstatus sukses (PASS).
3. **STOP DAN TUNGGU!** Setelah pengujian otomatis pada sebuah fase selesai dan sukses, Anda WAJIB berhenti dan melaporkan hasilnya kepada Pengguna (User). Minta Pengguna melakukan "Pengujian Manual". **JANGAN PERNAH** melanjutkan penulisan kode ke fase berikutnya sebelum Pengguna memberikan izin/perintah lanjut secara eksplisit!

---

## 1. Rekomendasi Tech Stack (Full-Stack)
*   **Framework:** Next.js (App Router), React.js.
*   **Styling & UI:** TailwindCSS, shadcn/ui, Radix UI, `lucide-react`.
*   **Database:** SQLite.
*   **ORM:** Prisma.
*   **Drag & Drop:** `@hello-pangea/dnd` atau `dnd-kit`.
*   **Testing:** Playwright (untuk E2E Browser Testing) & Jest/Vitest (opsional untuk unit test).

---

## 2. Rencana Implementasi Bertahap

### Fase 1: Setup Proyek, Database SQLite, & Layout Dasar
**Fokus:** Menyiapkan kerangka kerja dan struktur data dasar.
1.  **Inisialisasi Proyek:** Next.js, TailwindCSS, TypeScript, dan Playwright.
2.  **Setup Database:** Buat `schema.prisma` (Tabel: `User`, `Company`, `Contact`, `Deal`, `Task`, `Event`, `Call`) dan inisialisasi SQLite.
3.  **Database Seeding:** Buat skrip `seed.ts` untuk mempopulasi database SQLite dengan *dummy data*.
4.  **Layout Utama:** Komponen Sidebar dan TopBar statis yang membungkus *global layout*.

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Proyek bisa dikompilasi tanpa *error*, database memiliki tabel lengkap dan terisi data *dummy*, serta *layout* dasar aplikasi muncul ketika diakses.
*   **Otomatisasi:** AI membuat dan menjalankan skrip Playwright (`fase1.spec.ts`) yang memastikan server menyala di URL `/`, dan elemen navigasi Sidebar (mengandung teks "Dashboard", "Deals", dll) serta TopBar ter-render sempurna di DOM browser.

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna dan TUNGGU INSTRUKSI!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Jalankan `npm run dev`. Buka browser ke `http://localhost:3000`.
2.  Pastikan Sidebar navigasi di sisi kiri (warna gelap) dan TopBar di atas terlihat rapi (meskipun area tengah masih kosong).
3.  Buka terminal, jalankan perintah `npx prisma studio`. Pastikan di dalam peramban Prisma Studio tabel `Company`, `Contact`, dll sudah terbentuk dan terisi dengan puluhan baris data palsu.

---

### Fase 2: Modul Core Data (Companies & Contacts)
**Fokus:** Membangun entitas dasar lengkap dengan UI Tabel, Form Tambah, dan Halaman Detail.
1.  **Modul Companies:** Buat tabel data (`/companies`), *form/modal* penambahan perusahaan, dan halaman detail *read-only*.
2.  **Modul Contacts:** Buat tabel data (`/contacts`) dengan Query *Join* ke tabel Company agar relasi muncul. Buat *form* tambah (dengan fitur *dropdown select* untuk memilih relasi Company).

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Fitur operasi *Create* dan *Read* untuk Company dan Contact berfungsi penuh hingga ke database SQLite. Sistem relasi antara Contact ke Company berjalan sempurna di *Frontend*.
*   **Otomatisasi:** AI membuat dan menjalankan skrip (`fase2.spec.ts`) yang mengotomatisasi browser untuk: (1) Navigasi ke `/companies`, mengisi *form* `+ Company`, klik simpan, dan melakukan asersi nama perusahaan baru tersebut tampil di baris tabel. (2) Menuju ke `/contacts`, membuat *Contact* baru, **menguji fungsionalitas relasi dengan memilih *Company* dari *dropdown***, dan asersi data tersimpan.

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna dan TUNGGU INSTRUKSI!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Buka menu `Companies`. Klik tombol `+ Company`, isi data sembarang, dan simpan. Pastikan datanya masuk ke tabel (scroll/cari).
2.  Buka menu `Contacts`. Klik tombol `+ Contact`, pastikan saat mengisi form, Anda bisa mengklik *dropdown* perusahaan dan melihat/memilih perusahaan yang baru saja Anda buat di langkah 1.
3.  Klik salah satu nama baris data kontak/perusahaan di tabel dan pastikan panel "Detail Data" muncul memuat informasi lengkap.

---

### Fase 3: Modul Activities (Tasks, Events, Calls)
**Fokus:** Sistem pencatatan log dengan antarmuka dinamis (*Tabs*) dalam satu halaman tanpa *reload*.
1.  **Struktur Tab Activities:** Buat halaman `/activities` dengan 3 tombol Tab (Tasks, Events, Calls). Mengklik tab hanya mengganti komponen tabel di bawahnya (menggunakan *state*).
2.  **Tab Tabel:** Render tabel masing-masing (Tasks, Events, Calls) dan buat *form* penambahan datanya. (Khusus form `Call`, harus ada relasi *dropdown* ke tabel `Contact`).

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Mekanisme perpindahan Tab berjalan secara *client-side* (*SPA flow*). Pembuatan log aktivitas dengan relasi ke kontak tersimpan di database.
*   **Otomatisasi:** AI menulis skrip (`fase3.spec.ts`) yang: menekan tab "Tasks", "Events", dan "Calls" berturut-turut lalu asersi komponen berubah. Kemudian bot otomatis mencoba membuat rekaman `Call` baru dan mengaitkannya pada kontak (yang dibuat di fase 2).

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna dan TUNGGU INSTRUKSI!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Buka menu `Activities`.
2.  Klik bergantian tab teks navigasi "Tasks", "Events", dan "Calls". Pastikan isi tabel di bawahnya berganti seketika (mulus tanpa layar putih/reload peramban).
3.  Tetap di tab `Calls`, cobalah buat riwayat telepon baru dengan klien. Pastikan *dropdown* kontak menampilkan daftar kontak Anda.

---

### Fase 4: Modul Sales Pipeline (Deals Kanban)
**Fokus:** Pembuatan antarmuka visual kompleks Kanban (*Drag & Drop*) beserta *state management* optimistik untuk performa kalkulasi instan.
1.  **Kanban UI:** Buat `/deals` dengan susunan 6 kolom *Stage*.
2.  **Fungsi Drag and Drop:** Integrasikan library DnD (contoh: `dnd-kit`). Saat kartu selesai dipindahkan, tembak API mutasi (update *stage* di database).
3.  **Kalkulasi Real-time (Optimistic):** Gunakan array `reduce` / *helper function* untuk men-sum nilai `Amount` semua kartu di satu kolom, tampilkan di atas/header kolom. **Wajib:** Saat kartu diseret, angka total di kolom awal dan tujuan **harus langsung berubah (*optimistic update*)** sebelum respon dari database kembali.

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Kalkulasi *Total Value* sesuai persis dengan nominal kartu. Logika *Drag and Drop* merubah properti *database* dengan sukses tanpa merusak UI.
*   **Otomatisasi:** AI membuat skrip mahir (`fase4.spec.ts`) yang: mengekstrak nilai *Total Value* sebuah kolom, menggunakan Playwright *mouse drag API* untuk menggeser kartu ke kolom lain, lalu memvalidasi/asersi matematis bahwa header `Total Value` di kolom asal berkurang sempurna dan kolom tujuan bertambah sempurna sesuai nilai di kartu.

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna dan TUNGGU INSTRUKSI!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Buka menu `Deals`. Perhatikan ada 6 kolom (*Qualification*, dll).
2.  Perhatikan **Total Uang** yang tertulis tebal di bawah judul kolom `Qualification` dan di kolom `Proposal`.
3.  Lakukan *klik-tahan-geser* (Drag) salah satu kartu di kolom `Qualification`, lalu lepaskan (Drop) di kolom `Proposal`.
4.  **Tes Kritis:** Pastikan tanpa ada jeda (*loading/spinner*), angka uang di *header* kedua kolom tersebut langsung bertambah/berkurang dengan nominal matematika yang presisi. Tekan *F5* (*Refresh* halaman), pastikan posisi kartu tidak kembali ke kolom asal (update database sukses).

---

### Fase 5: Modul Dashboard & Finalisasi Keseluruhan
**Fokus:** Layar rangkuman eksekutif (Agregasi Data) dan proteksi *login dummy*.
1.  **Autentikasi:** Halaman `/login` statis. Jika tombol diklik (tanpa validasi ketat), anggap masuk dan letakkan variabel sesi di *cookie/storage*.
2.  **Widget Dashboard:** Agregasi/Hitung nilai `Total Revenue` (SUM amount dari Deal 'Closed Won'), `Active Deals` (Count Deal selain *Closed*), dan `Pending Tasks`.
3.  **Pipeline Chart:** Render grafik visual (misal via `recharts` / batang CSS murni) dan panggil 5 baris data log aktivitas terbaru.

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Sinkronisasi silang (*Cross-module synchronization*) berjalan. Nilai `Total Revenue` mutlak sama dengan total uang di kolom *Closed Won* pada layar Kanban. Alur dari Login -> Dashboard terlindungi.
*   **Otomatisasi:** AI membuat skrip (*End-to-End full flow*) (`fase5.spec.ts`): Melakukan navigasi ke form *login*, klik submit, memastikan *redirect* ke Dashboard berhasil. Bot lalu membaca angka `Total Revenue`, pindah ke halaman `Deals`, menyeret kartu bernilai $500 ke kolom `Closed Won`, pindah kembali ke `Dashboard`, dan asersi memastikan bahwa metrik `Total Revenue` telah bertambah tepat $500.

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna dan TUNGGU INSTRUKSI!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Buka aplikasi di peramban *Incognito/Private Mode*. Pastikan Anda tidak bisa masuk tanpa menekan tombol di halaman *Login*.
2.  Setelah *login* dan masuk ke *Dashboard*, catat/ingat nominal angka `Total Revenue`.
3.  Pindah ke halaman `Deals`. Cari kartu apa saja, dan geser kartu tersebut hingga masuk ke tahap paling ujung (`Closed Won`).
4.  Pindah ke halaman `Dashboard` lagi. Periksa *summary card* `Total Revenue`, pastikan kini jumlahnya telah bertambah persis sesuai nominal yang tertera di kartu yang Anda geser tadi.
5.  Eksplorasi aplikasi secara bebas untuk memverifikasi apakah alur *End-to-End* terasa kokoh.

---

### Fase 6: Fitur Detail Deal Inline di Bawah Kanban
**Fokus:** Menambahkan interaksi pada papan Kanban agar ketika sebuah kartu Deal di-klik, informasi lengkap Deal tersebut muncul di bagian bawah layar tanpa perlu berpindah halaman.
1.  **State Management UI:** Pada `src/components/DealsClient.tsx`, tambahkan *state* untuk mendeteksi `selectedDealId`.
2.  **Komponen Inline Detail:** Buat tampilan antarmuka panel detail yang akan muncul persis di bawah Kanban board saat sebuah kartu dipilih.
3.  **Interaksi Kartu:** Tambahkan aksi `onClick` pada kartu *Deal* di kanban untuk mengubah state `selectedDealId`.

**✅ Acceptance Criteria & Pengujian Otomatis:**
*   **Kriteria:** Mengklik sebuah kartu transaksi tidak me-refresh halaman, melainkan membuka rincian spesifik di bawah Kanban board.
*   **Otomatisasi:** AI membuat skrip *End-to-End full flow* (`fase6.spec.ts`) yang: menekan salah satu kartu di papan kanban lalu memastikan *element* panel detail muncul memuat informasi yang sama dengan nama kartu yang ditekan.

**🛑 CHECKPOINT UNTUK AI:** Lapor ke pengguna bahwa proyek SELESAI dan TUNGGU instruksi serah-terima akhir!

**👉 Pengujian Manual (Untuk Pengguna):**
1.  Buka aplikasi dan pergi ke menu `Deals`.
2.  Klik di area kosong di dalam salah satu kartu (jangan di-_drag_).
3.  Pastikan informasi *detail deal* muncul tepat di bawah *kanban board*.
4.  Klik kartu yang lain, pastikan rincian yang ada di *panel* bawah juga ikut ter-update.
