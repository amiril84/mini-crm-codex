# Product Requirement Document (PRD): Mini CRM Web Application

## 1. Pendahuluan
Dokumen ini berisi spesifikasi kebutuhan untuk pengembangan purwarupa (prototype) aplikasi Mini CRM berbasis web. PRD ini dirancang khusus sebagai instruksi referensi untuk Model AI (Developer) dalam mengimplementasikan kode aplikasi dari awal. Referensi desain, menu, dan alur data diambil dari serangkaian *screenshot* yang disediakan dan dilengkapi dengan standar industri perangkat lunak CRM berdasarkan analisis alur kerja (*user flow*) yang lengkap.

## 2. Arahan Desain UI/UX & Tema (Berdasarkan Screenshot)
Aplikasi memiliki desain modern, bersih, profesional dengan tata letak bergaya *enterprise/dashboard*.

*   **Layout Utama:**
    *   **Sidebar Kiri:** Memiliki tema gelap (Dark Navy/Slate, misal: `#1F2937` atau `#111827`). Berfungsi sebagai wadah menu navigasi utama.
    *   **Header/Top Bar:** Memiliki tema terang (Putih atau Light Gray). Berisi logo aplikasi (misal: "Bigin"), kotak pencarian (*Search bar*) berbentuk kapsul, ikon notifikasi (lonceng), ikon billing, pengaturan (gear), dan avatar profil pengguna.
    *   **Area Konten Utama:** Memiliki latar belakang putih (`#FFFFFF`) dengan padding yang lega.
*   **Skema Warna:**
    *   **Warna Aksen Utama (Primary):** Hijau Teal/Emerald (mirip `#10B981` atau `#00A65A`). Digunakan untuk tombol *Call-to-Action* utama (Cth: `+ Contact`), status menu sidebar yang sedang aktif, ikon indikator, dan garis bawah penanda tab aktif.
    *   **Teks:** Abu-abu tua/Hitam pekat untuk teks utama data, abu-abu muda (`#6B7280`) untuk teks label/header tabel.
*   **Tipografi:** Gunakan font *sans-serif* yang bersih dan terbaca jelas seperti `Inter`, `Roboto`, atau standar *system font*.
*   **Komponen UI Spesifik:**
    *   **Tabel Data:** Tabel bersih tanpa garis vertikal. Memiliki *checkbox* di kolom paling kiri untuk aksi massal, header kolom teks tebal/bold dengan ikon panah (sortable), dan garis batas horizontal bawah (border-bottom) tipis yang memisahkan setiap baris. Baris bisa memiliki efek warna latar tipis saat di-*hover*.
    *   **Tombol (Buttons):** Tombol utama aksi berbentuk kapsul (*rounded-full* atau radius tinggi) berwarna latar hijau dengan teks putih.
    *   **Kanban Board:** Khusus untuk modul *Deals/Sales Pipeline*, gunakan antarmuka kolom (*lanes*) dan kartu (*cards*) vertikal dengan layout mendatar (horizontal scroll jika berlebih).

## 3. Struktur Navigasi Utama (Sidebar Menu)
Sidebar diletakkan di sisi kiri layar dengan susunan menu vertikal berikut (urut dari atas):
1.  **Dashboard** (Ikon: Pie Chart)
2.  **Deals** (Ikon: Kantong Uang)
3.  **Contacts** (Ikon: Ikon 2 Orang/Grup)
4.  **Companies** (Ikon: Gedung Perkantoran)
5.  **Products** (Ikon: Kotak/Kardus Paket)
6.  **Activities** (Ikon: Papan Klip/Task)

*(Catatan Implementasi: AI harus membuat keseluruhan halaman ini fungsional, kecuali 'Products' sementara bisa berupa tabel kosong/placeholder sederhana).*

## 4. Spesifikasi Modul Detail

Berdasarkan analisis *User Flow*, terdapat tambahan modul esensial yang menunjang kelengkapan aplikasi CRM ini:

### 4.1. Modul Autentikasi (Login) - *Modul Tambahan*
Halaman gerbang utama bagi pengguna (staf penjual) sebelum dapat mengakses CRM.
*   **UI:** Layar penuh (*full screen*) dengan latar belakang terang atau bergradien halus, menampilkan *card* form di tengah (Center Card).
*   **Input Form:** Input `Email Address` dan `Password`.
*   **Aksi Utama:** Tombol hijau tebal "Sign In" / "Login".
*(Catatan untuk AI: Autentikasi bisa dibuat sederhana/dummy untuk tahap prototipe, atau dihubungkan dengan library auth standard seperti NextAuth/Supabase).*

### 4.2. Modul Dashboard
Berfungsi sebagai halaman ringkasan eksekutif dan analitik singkat yang muncul pertama kali saat pengguna *login*.
*   **UI:** Terdiri dari kumpulan *Card/Widget* (Grid layout).
*   **Widget yang Harus Diimplementasikan:**
    1.  **Summary Cards (Kartu Angka Besar):**
        *   Total Revenue (Total pendapatan dari Deals berstatus *Closed Won*)
        *   Active Deals (Jumlah Deals yang sedang berjalan)
        *   Pending Tasks (Jumlah Tugas dengan status *In Progress/Pending*)
    2.  **Pipeline Chart (Grafik):** Grafik *Bar Chart* vertikal atau grafik *Funnel* (corong) yang menunjukkan distribusi uang (Amount) di masing-masing tahapan *Sales Pipeline*.
    3.  **Recent Activities:** Sebuah senarai (*list*) kecil berisi aktivitas terbaru yang dilakukan di aplikasi (misal log 5 Tasks atau Calls terakhir).

### 4.3. Modul Deals (Sales Pipeline)
Menampilkan peluang penjualan atau *prospecting* yang sedang diproses. Modul ini merupakan inti dari fitur penjualan (Pipeline CRM).
*   **UI:** Halaman *Kanban Board* (Papan Kanban). Papan berisi kolom-kolom berdampingan sesuai tahapan (*Stages*).
*   **Fungsionalitas Kritis (Drag & Drop + Kalkulasi Otomatis):**
    *   Pada setiap *header* kolom tahapan, harus mencantumkan **Angka Total Value (Total akumulasi dari field "Amount" pada semua kartu yang ada di kolom tersebut)**.
    *   Aplikasi harus memfasilitasi fungsionalitas **Drag and Drop**. Pengguna dapat menggeser kartu Deal dari satu kolom ke kolom lainnya.
    *   **Kalkulasi Instan:** Begitu kartu dilepas (*dropped*) di kolom baru, **Angka Total Value di header kolom asal (pengurangan) dan header kolom tujuan (penambahan) harus seketika ter-update secara otomatis di antarmuka (*Optimistic UI*)** tanpa perlu memuat ulang halaman (*refresh*).
    *   **Interaksi Detail (Inline View):** Saat pengguna mengklik salah satu kartu Deal di papan Kanban, akan muncul sebuah panel detail di bagian bawah Kanban Board tanpa berpindah halaman. Panel ini memuat informasi rincian deal tersebut (informasi lengkap, relasi kontak/perusahaan).
*   **Struktur Kanban (Tahapan Pipeline):**
    1.  `Qualification`
    2.  `Needs Analysis`
    3.  `Proposal/Price Quote`
    4.  `Negotiation`
    5.  `Closed Won` (Berhasil gol, warnai aksen kolom ini dengan hijau)
    6.  `Closed Lost` (Gagal, warnai aksen abu/merah)
*   **Data Card (Kartu Deal):** Menampilkan detail ringkas: `Deal Name`, `Amount` (Nilai mata uang), `Company/Contact Name`, dan `Expected Close Date`.

### 4.4. Modul Companies (Perusahaan)
Menampilkan daftar organisasi atau perusahaan prospek/klien.
*   **UI:** Halaman *List/Tabel Data*.
*   **Aksi Utama:** Tombol hijau `+ Company` di pojok kanan atas tabel.
*   **Kolom Tabel:** `[Checkbox]`, `Company Name`, `Phone`, `Website`, `Company Owner`, `Created Time`.

### 4.5. Modul Contacts (Kontak)
Menampilkan daftar perorangan/klien.
*   **UI:** Halaman *List/Tabel Data*.
*   **Aksi Utama:** Tombol hijau `+ Contact` di pojok kanan atas tabel.
*   **Kolom Tabel:** `[Checkbox]`, `Contact Name`, `Company Name`, `Email`, `Phone`, `Contact Owner`.

### 4.6. Modul Activities (Aktivitas)
Memiliki 3 Sub-Tab mendatar: **Tasks**, **Events**, dan **Calls**. Ketiganya memiliki format UI Tabel Data.
*   **Aksi Utama:** Terdapat tombol aksi hijau global `+ Task`, `+ Event`, `+ Call` di kanan atas.
*   **Tab Tasks:** `[Checkbox]`, `Task Name`, `Due Date`, `Status` (Completed, In Progress), `Priority` (High, Normal, Low), `Owner`.
*   **Tab Events:** `[Checkbox]`, `Title`, `From`, `To`, `Owner`.
*   **Tab Calls:** `[Checkbox]`, `To/From` (Dilengkapi ikon indikator panah), `Call Type` (Inbound/Outbound), `Call Start Time`, `Call Duration`, `Owner`.

### 4.7. Halaman Detail Data (Record View) - *Modul Tambahan*
Berfungsi sebagai halaman untuk melihat rincian saat pengguna mengklik salah satu baris di tabel Contacts, Companies, atau Deals.
*   **UI:** Tampilan *Slide-over panel* dari sisi kanan layar, atau di-mengarahkan (navigate) ke halaman penuh baru yang khusus menampilkan data tersebut.
*   **Isi Tampilan Detail:**
    *   **Header Informasi:** Menampilkan Nama Entitas besar beserta tombol aksi `Edit` dan `Delete`.
    *   **Field Data:** Menampilkan semua kolom/field dari database (read-only mode).
    *   **Related Lists (Data Terkait):** Di bagian bawah halaman detail *Company* atau *Contact*, harus terdapat *sub-list* yang menampilkan Daftar Deals dan Daftar Activities (Tasks/Calls) yang secara spesifik terikat dengan *Company* atau *Contact* tersebut.

## 5. Flow Pengguna (End-to-End User Flow)
Berikut adalah alur penggunaan aplikasi dari awal sampai akhir (*end-to-end*) oleh seorang pengguna agen penjualan (Sales). AI Developer harus merancang struktur antar muka (*routing*, pergerakan data antar halaman) yang menjamin seluruh alur skenario ini berjalan lancar:

1.  **Login & Overview:** Pengguna masuk aplikasi melalui **Halaman Login**. Setelah berhasil, layar mengarahkan pengguna ke **Dashboard**. Di sini, ia melihat sekilas pencapaian harian (Summary metrik) dan agenda (Tasks yang *Pending*).
2.  **Menemukan Prospek (Leads):** Pengguna mendapatkan informasi kontak dari prospek bisnis baru. Ia ingin memasukkan datanya ke dalam CRM.
3.  **Input Data Perusahaan:** Pengguna membuka menu **Companies**, mengklik tombol `+ Company`. Sebuah *modal/form* muncul, pengguna mengisi informasi perusahaan (Nama, Website, dsb) lalu menyimpannya.
4.  **Input Data Kontak:** Kemudian, pengguna masuk ke menu **Contacts** dan mengklik `+ Contact`. Di dalam form Kontak, pengguna mengisi data personal klien, **dan pada kolom "Company Name", pengguna dapat memilih Perusahaan yang baru saja ia buat di langkah 3 (Relasi Dropdown/Select)**.
5.  **Melakukan Follow Up (Mencatat Aktivitas):** Pengguna menelepon klien tersebut. Setelah selesai, ia masuk ke menu **Activities**, tab **Calls**, lalu mengklik `+ Call`. Ia mencatat rincian percakapan dan durasi, mengaitkan panggilan tersebut ke kontak tadi. Pengguna juga menjadwalkan tugas (Task) "Follow-up proposal minggu depan" di tab **Tasks**.
6.  **Membuat Peluang Penjualan (Deal):** Klien menyatakan minat serius. Pengguna lalu pindah ke menu **Deals**, mengklik `+ Deal`. Ia membuat kartu transaksi baru (misal: "Proyek Pembelian A"), mengisikan nilai `Amount` (misalnya: $10,000), mengaitkannya ke kontak tadi, lalu menempatkannya di tahap paling awal (`Qualification`). Total uang (Total Value) di *header* kolom `Qualification` otomatis bertambah senilai $10,000.
7.  **Menjalankan Sales Pipeline (Drag & Drop):** Berminggu-minggu berlalu dan negosiasi terus berlanjut. Pengguna membuka papan **Deals**, lalu melakukan **klik-tahan (Drag) kartu deal tersebut dari kolom `Qualification` dan melepaskannya (Drop) ke kolom `Proposal/Price Quote`**. 
8.  **Update Kalkulasi Total Deal (Instan):** Seketika itu juga, angka *Total Value* di kolom `Qualification` berkurang $10,000, dan angka di kolom `Proposal/Price Quote` bertambah $10,000 tanpa perlu *refresh* peramban web (browser).
9.  **Penutupan Transaksi (Closed Won):** Akhirnya klien setuju untuk membeli. Pengguna menggeser lagi (drag) kartu Deal tersebut dari *Proposal* ke kolom paling akhir `Closed Won`.
10. **Refleksi Data Utama:** Pengguna lalu kembali ke menu **Dashboard** dan melihat bahwa angka `Total Revenue` (Pendapatan Keseluruhan) pada *summary card* kini telah bertambah $10,000 secara sistem, mencerminkan deal yang baru saja dimenangkan. Proses alur berakhir.

## 6. Skema Database (Tabel, Kolom, & Relasi)
Berikut adalah instruksi rancangan skema basis data (*Database Schema*) yang harus digunakan oleh AI untuk mengimplementasikan *backend* aplikasi ini. Baik menggunakan database relasional SQL (PostgreSQL/MySQL) via ORM (seperti Prisma) maupun NoSQL, struktur relasionalnya harus memenuhi kriteria berikut:

### 6.1. Tabel: `users`
Menyimpan data staf/pegawai CRM yang masuk (login).
*   `id` (PK, UUID/Auto-increment)
*   `name` (String, e.g., "Amelia Burrows")
*   `email` (String, Unique)
*   `created_at` (Timestamp)

### 6.2. Tabel: `companies`
Menyimpan organisasi klien.
*   `id` (PK)
*   `name` (String, e.g., "Amazing Corp")
*   `phone` (String)
*   `website` (String)
*   `owner_id` (FK -> `users.id`, mencerminkan 'Company Owner')
*   `created_at` (Timestamp)

### 6.3. Tabel: `contacts`
Menyimpan individu prospek/klien.
*   `id` (PK)
*   `name` (String, e.g., "Terrel Scaddon")
*   `email` (String)
*   `phone` (String)
*   `company_id` (FK -> `companies.id`, relasi One-to-Many dari Company ke Contacts. Bisa kosong/null jika kontak perorangan)
*   `owner_id` (FK -> `users.id`, mencerminkan 'Contact Owner')
*   `created_at` (Timestamp)

### 6.4. Tabel: `deals`
Menyimpan data Sales Pipeline / Penawaran transaksi.
*   `id` (PK)
*   `deal_name` (String, e.g., "Software License Q3")
*   `amount` (Decimal/Float, nilai uang dalam transaksi)
*   `stage` (Enum/String: `Qualification`, `Needs Analysis`, `Proposal/Price Quote`, `Negotiation`, `Closed Won`, `Closed Lost`)
*   `expected_close_date` (Date/Timestamp)
*   `company_id` (FK -> `companies.id`, opsional)
*   `contact_id` (FK -> `contacts.id`, opsional)
*   `owner_id` (FK -> `users.id`, mencerminkan 'Deal Owner')
*   `created_at` (Timestamp)

### 6.5. Tabel Aktivitas (Tasks, Events, Calls)
AI dapat mengimplementasikan ini sebagai satu entitas besar (Polymorphic/Single Table) atau 3 tabel terpisah yang dihubungkan ke objek target. Disarankan **3 Tabel Terpisah** untuk kemudahan pemisahan modul.

*   **Tabel `tasks`:**
    *   `id` (PK)
    *   `task_name` (String)
    *   `due_date` (Date)
    *   `status` (Enum/String: `Completed`, `In Progress`, `Pending`)
    *   `priority` (Enum/String: `High`, `Normal`, `Low`)
    *   `owner_id` (FK -> `users.id`, mencerminkan 'Task Owner')

*   **Tabel `events`:**
    *   `id` (PK)
    *   `title` (String)
    *   `start_time` (Timestamp, e.g., May 03 10:00 AM)
    *   `end_time` (Timestamp, e.g., May 03 11:00 AM)
    *   `owner_id` (FK -> `users.id`)

*   **Tabel `calls`:**
    *   `id` (PK)
    *   `contact_id` (FK -> `contacts.id`, untuk mengetahui dengan siapa melakukan telepon 'To/From')
    *   `direction` (Enum/String: `Inbound`, `Outbound`)
    *   `start_time` (Timestamp)
    *   `duration_seconds` (Integer)
    *   `owner_id` (FK -> `users.id`)

*(Catatan ORM: Saat AI merender tampilan Frontend, field berakhiran `_id` seperti `owner_id` wajib di-join dengan tabel `users` untuk menampilkan kolom `name` di tabel UI).*

## 7. Instruksi Teknis Tambahan (Untuk AI Developer)
*   **Framework Frontend & UI:** Disarankan menggunakan **Next.js (App Router)** dipadukan dengan **TailwindCSS** beserta komponen antarmuka yang modern (seperti *shadcn/ui* atau *headless UI*).
*   **Database Seeding:** AI *DIWAJIBKAN* membuat skrip *Seeder* (misal: `seed.ts` pada Prisma) yang memasukkan puluhan baris *dummy data* ke tabel-tabel di atas. Data dummy harus mencerminkan nama-nama seperti yang ada di screenshot ("Zylker", "Amazing Corp", "Patricia Boyle") agar hasil akhirnya persis seperti di referensi.
*   **Drag and Drop Library:** Gunakan *library* khusus seperti `@hello-pangea/dnd` atau `dnd-kit` untuk mengaktifkan fungsionalitas memindahkan kartu Deals di Kanban Board secara halus.
*   **State Management (Deals Update):** Untuk efek pembaruan instan *Total Value* saat kartu di-drag and drop, gunakan konsep *Optimistic Update* di sisi klien (menggunakan standard state React/Vue atau library seperti React Query/SWR) sebelum status sepenuhnya tersimpan di server.
