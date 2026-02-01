# Aplikasi Akuntansi Sederhana (Web, LocalStorage / API)

Aplikasi akuntansi berbasis web dengan pola adapter storage:
- **Mode LocalStorage** (default, tanpa server)
- **Mode API** (backend Node.js + Express + Knex; default database SQLite, bisa diganti MySQL)

## Cara Menjalankan (Frontend)

- Buka file `index.html` langsung di browser modern (Chrome, Firefox, Edge, Safari).
- Mode default memakai LocalStorage, tidak perlu server.

## Menjalankan Backend API (Node.js)

1. Pastikan Node.js terpasang.
2. Install dependency:
   ```bash
   npm install
   ```
3. Jalankan server API (default port 4000, SQLite di `data/db.sqlite`):
   ```bash
   npm start
   ```
4. (Opsional) Ubah database ke MySQL dengan environment variable:
   ```bash
   set DB_CLIENT=mysql2
   set DB_HOST=localhost
   set DB_PORT=3306
   set DB_USER=root
   set DB_PASSWORD=your_password
   set DB_NAME=akuntansi
   npm start
   ```

## Menggunakan Frontend dengan API

Tambahkan config sebelum script `js/storage.js` di `index.html`:
```html
<script>
  window.appConfig = {
    storage: {
      type: "api",
      apiBaseUrl: "http://localhost:4000/api"
    }
  };
</script>
```
Setelah itu, backend akan menjadi sumber data untuk akun/jurnal.

## Fitur Utama

- Input transaksi harian (debit/kredit sederhana).
- Jurnal umum otomatis dari transaksi.
- Buku besar per akun.
- Trial balance (validasi total debit/kredit).
- Laporan laba rugi dan neraca.
- Neraca lajur/kertas kerja.
- Kelola akun (tambah/edit).
- Backup/restore data (LocalStorage atau API yang mendukung endpoint export/import).
