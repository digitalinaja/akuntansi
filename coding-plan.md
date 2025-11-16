\# Aplikasi Akuntansi

Aplikasi akuntansi sederhana berbasis web yang menggunakan LocalStorage untuk penyimpanan data. Aplikasi ini mencakup modul akuntansi inti seperti Jurnal Umum, Buku Besar, Trial Balance, Laporan Keuangan, serta pengelolaan akun dan neraca lajur.

\## Fitur

\### ?? Modul Utama (sudah diimplementasikan)
1\. \*\*Akun\*\*
   - Menampilkan daftar akun (kode, nama, tipe, saldo normal)
   - Tambah akun baru melalui form (modal)
   - Edit akun yang sudah ada (nama, tipe, saldo normal)
   - Data akun tersimpan di LocalStorage

2\. \*\*Transaksi Harian\*\*
   - Input transaksi sederhana (tanggal, referensi, deskripsi)
   - Pilih akun debit dan kredit dari daftar akun
   - Validasi dasar: semua field wajib, akun debit ≠ akun kredit, jumlah \> 0
   - Penyimpanan transaksi ke LocalStorage sebagai jurnal

3\. \*\*Jurnal Umum\*\*
   - Menampilkan semua transaksi dalam format debit/kredit
   - Otomatis terisi dari transaksi harian
   - Ditampilkan dalam tabel dengan akun dan nominal debit/kredit

4\. \*\*Buku Besar\*\*
   - Rekap mutasi debit/kredit per akun
   - Menampilkan daftar transaksi per akun (tanggal, referensi, deskripsi, debit, kredit)
   - Menampilkan saldo akhir per akun di header kartu

5\. \*\*Trial Balance\*\*
   - Menampilkan saldo akhir setiap akun dalam kolom Debit/Kredit
   - Menampilkan total debit dan total kredit
   - Highlight apakah neraca seimbang (total debit = total kredit)

6\. \*\*Laporan Laba Rugi\*\*
   - Mengelompokkan akun tipe Pendapatan dan Beban
   - Menghitung total pendapatan, total beban, dan laba/rugi bersih

7\. \*\*Neraca (Statement of Financial Position)\*\*
   - Mengelompokkan akun tipe Aset, Kewajiban, dan Modal
   - Menghitung total Aset serta total Kewajiban + Modal

8\. \*\*Neraca Lajur / Kertas Kerja\*\*
   - Menampilkan setiap akun dengan kolom:
     - Saldo (Debit/Kredit)
     - Laba Rugi (Debit/Kredit)
     - Neraca (Debit/Kredit)
   - Otomatis mengisi kolom Laba Rugi untuk akun Pendapatan/Beban
   - Otomatis mengisi kolom Neraca untuk akun Aset/Kewajiban/Modal
   - Menampilkan total per kolom di bagian bawah tabel

\### ?? Rencana Fitur Lanjutan (belum diimplementasikan)
9\. \*\*Laporan Arus Kas\*\*
   - Menghitung arus kas masuk dan keluar berdasarkan kategori
   - Kategori: Operasi, Investasi, dan Pendanaan

10\. \*\*Aging Piutang/Hutang\*\*
    - Mengelompokkan piutang dan hutang berdasarkan umur (0-30, 31-60, 61-90, \>90 hari)

11\. \*\*Rekonsiliasi Bank\*\*
    - Cocokkan transaksi bank dengan jurnal kas/bank
    - Tampilkan selisih dan hasil rekonsiliasi

\## ?? Cara Menggunakan

\### Persyaratan
\- Browser modern dengan dukungan LocalStorage
\- Tidak memerlukan instalasi server atau database

\### Instalasi
1\. Clone atau download repository ini
2\. Buka file \`index.html\` di browser

\### Penggunaan Awal
1\. Buka aplikasi di browser
2\. Aplikasi akan otomatis membuat akun default saat pertama kali dibuka
3\. Jika perlu, tambahkan/edit akun melalui menu "Akun"
4\. Mulai input transaksi melalui menu "Transaksi Harian"
5\. Lihat jurnal yang dibuat otomatis di menu "Jurnal Umum"
6\. Lihat Buku Besar, Trial Balance, Neraca Lajur, Laba Rugi, dan Neraca di menu terkait

\### Backup dan Restore Data
\- \*\*Backup\*\*: Klik tombol "Export Data" di navbar untuk mengunduh backup
\- \*\*Restore\*\*: Klik tombol "Import Data" dan pilih file backup yang telah diunduh

\## ?? Struktur Folder

\`\`\`
accounting-app/
��� index.html              # Halaman utama
��� css/
�   ��� style.css           # Stylesheet aplikasi
��� js/
�   ��� storage.js          # Manajemen LocalStorage (akun + jurnal)
�   ��� accounts.js         # Manajemen akun (tambah/edit, akun default)
�   ��� journals.js         # Manajemen jurnal/transaksi
�   ��� reports.js          # Perhitungan laporan dan neraca lajur
�   ��� app.js              # Logika UI utama (routing view, event handler)
��� README.md               # Dokumentasi singkat
\`\`\`

\## ??? Teknologi yang Digunakan

\- \*\*Frontend\*\*: HTML5, CSS3, JavaScript (ES6+)
\- \*\*UI Framework\*\*: Bootstrap 5
\- \*\*Icons\*\*: Bootstrap Icons
\- \*\*Storage\*\*: Browser LocalStorage
\- \*\*State Management\*\*: JavaScript Classes

\## ?? Model Data

\### Akun
\`\`\`javascript
{
  id: '101',
  name: 'Kas',
  type: 'Aset',          // 'Aset' | 'Kewajiban' | 'Modal' | 'Pendapatan' | 'Beban'
  normalBalance: 'Debit' // 'Debit' | 'Kredit'
}
\`\`\`

\### Jurnal
\`\`\`javascript
{
  id: 1,
  date: '2025-11-12',
  description: 'Pembelian alat tulis',
  reference: 'INV-001',
  debit: [{ account: '101', amount: 100000 }],
  credit: [{ account: '201', amount: 100000 }]
}
\`\`\`

\## ?? Pengembangan

\### Menambah / Mengelola Akun
1\. Gunakan menu "Akun" di aplikasi untuk tambah/edit akun
2\. Perubahan akan otomatis tersimpan di LocalStorage dan digunakan di semua modul (Transaksi, Jurnal, Laporan)

\### Menambah Fitur Baru
1\. Tambahkan fungsi di file JavaScript yang sesuai (\`storage.js\`, \`accounts.js\`, \`journals.js\`, \`reports.js\`, atau \`app.js\`)
2\. Tambahkan menu atau tombol di \`index.html\` bila perlu
3\. Hubungkan event handler di \`app.js\`

\### Customisasi Tampilan
\- Edit \`css/style.css\` untuk mengubah tampilan
\- Gunakan class Bootstrap untuk komponen UI

\## ?? Catatan Penting

1\. \*\*Data Disimpan Lokal\*\*: Semua data tersimpan di LocalStorage browser
2\. \*\*Backup Rutin\*\*: Lakukan backup data secara berkala
3\. \*\*Browser Compatibility\*\*: Aplikasi bekerja optimal di Chrome, Firefox, Safari, dan Edge modern
4\. \*\*Offline Mode\*\*: Aplikasi dapat digunakan tanpa koneksi internet

\## ?? Troubleshooting

\### Data Hilang
\- Data tersimpan di LocalStorage browser
\- Clear browser cache akan menghapus semua data
\- Selalu lakukan backup data secara berkala

\### Error Saat Input Transaksi
\- Pastikan semua field required terisi
\- Pastikan akun debit dan kredit sudah dipilih dan tidak sama
\- Pastikan jumlah lebih besar dari 0
\- Periksa konsol browser untuk detail error

\### Laporan Tidak Muncul / Tidak Balance
\- Pastikan ada transaksi pada periode yang dipilih (saat ini semua periode)
\- Periksa apakah akun sudah dikonfigurasi dengan tipe dan saldo normal yang benar
\- Refresh halaman dan coba lagi

\## ?? Lisensi

MIT License - Bebas digunakan dan dimodifikasi

\## ?? Kontribusi

1\. Fork repository
2\. Buat branch fitur baru
3\. Commit perubahan
4\. Push ke branch
5\. Buat Pull Request

\## ?? Kontak

Untuk pertanyaan atau bantuan, silakan buka issue di repository.
