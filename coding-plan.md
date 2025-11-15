\# Aplikasi Akuntansi

Aplikasi akuntansi sederhana berbasis web yang menggunakan LocalStorage untuk penyimpanan data. Aplikasi ini mencakup modul akuntansi inti seperti Jurnal Umum, Buku Besar, Trial Balance, Laporan Keuangan, dan lainnya.

\## Fitur

\### 📊 Modul Utama
1\. \*\*Transaksi Harian\*\*
   - Input pemasukan dan pengeluaran
   - Kategorisasi akun (Debit/Kredit)
   - Validasi form dan penyimpanan ke LocalStorage

2\. \*\*Jurnal Umum\*\*
   - Menampilkan semua transaksi dalam bentuk debit/kredit
   - Filter berdasarkan tanggal, akun, atau referensi
   - Tambah, edit, dan hapus jurnal

3\. \*\*Buku Besar\*\*
   - Rekap saldo per akun
   - Tabel mutasi debit dan kredit per akun
   - Filter berdasarkan periode

4\. \*\*Trial Balance\*\*
   - Menampilkan total debit dan kredit untuk semua akun
   - Validasi neraca harus balance

5\. \*\*Laporan Laba Rugi\*\*
   - Mengelompokkan akun pendapatan dan beban
   - Menghitung laba/rugi bersih

6\. \*\*Neraca (Statement of Financial Position)\*\*
   - Menampilkan Aset, Kewajiban, dan Modal
   - Validasi Aset = Kewajiban + Modal

7\. \*\*Laporan Arus Kas\*\*
   - Menghitung arus kas masuk dan keluar berdasarkan kategori
   - Kategori: Operasi, Investasi, dan Pendanaan

8\. \*\*Aging Piutang/Hutang\*\*
   - Mengelompokkan piutang dan hutang berdasarkan umur (0-30, 31-60, 61-90, >90 hari)

9\. \*\*Rekonsiliasi Bank\*\*
   - Cocokkan transaksi bank dengan jurnal kas/bank
   - Tampilkan selisih dan hasil rekonsiliasi

\## 🚀 Cara Menggunakan

\### Persyaratan
\- Browser modern dengan dukungan LocalStorage
\- Tidak memerlukan instalasi server atau database

\### Instalasi
1\. Clone atau download repository ini
2\. Buka file \`index.html\` di browser

\### Penggunaan Awal
1\. Buka aplikasi di browser
2\. Aplikasi akan otomatis membuat akun default saat pertama kali dibuka
3\. Mulai input transaksi melalui menu "Transaksi Harian"
4\. Lihat jurnal yang dibuat otomatis di menu "Jurnal Umum"
5\. Generate laporan keuangan kapan saja

\### Backup dan Restore Data
\- \*\*Backup\*\*: Klik tombol "Export Data" di navbar untuk mengunduh backup
\- \*\*Restore\*\*: Klik tombol "Import Data" dan pilih file backup yang telah diunduh

\## 📁 Struktur Folder

\`\`\`
accounting-app/
├── index.html              # Halaman utama
├── css/
│   └── style.css           # Stylesheet aplikasi
├── js/
│   ├── storage.js          # Manajemen LocalStorage
│   ├── accounts.js         # Manajemen akun
│   ├── journals.js         # Manajemen jurnal
│   ├── reports.js          # Pembuatan laporan
│   └── app.js              # Aplikasi utama
└── README.md               # Dokumentasi
\`\`\`

\## 🛠️ Teknologi yang Digunakan

\- \*\*Frontend\*\*: HTML5, CSS3, JavaScript (ES6+)
\- \*\*UI Framework\*\*: Bootstrap 5
\- \*\*Icons\*\*: Bootstrap Icons
\- \*\*Storage\*\*: Browser LocalStorage
\- \*\*State Management\*\*: JavaScript Classes

\## 📊 Model Data

\### Akun
\`\`\`javascript
{
  id: '101',
  name: 'Kas',
  type: 'Aset',
  normalBalance: 'Debit',
  description: 'Uang tunai dan di bank'
}
\`\`\`

\### Jurnal
\`\`\`javascript
{
  id: 1,
  date: '2025-11-12',
  description: 'Pembelian alat tulis',
  reference: 'INV-001',
  debit: \[{account: '101', amount: 100000}\],
  credit: \[{account: '201', amount: 100000}\]
}
\`\`\`

\## 🔧 Pengembangan

\### Menambah Akun Baru
1\. Buka browser developer tools
2\. Akses \`accountManager.addAccount()\` dengan data akun baru

\### Menambah Fitur Baru
1\. Tambahkan fungsi di file JavaScript yang sesuai
2\. Tambahkan menu di \`index.html\`
3\. Implementasikan fungsi di \`app.js\`

\### Customisasi Tampilan
\- Edit \`css/style.css\` untuk mengubah tampilan
\- Gunakan class Bootstrap untuk komponen UI

\## 📝 Catatan Penting

1\. \*\*Data Disimpan Lokal\*\*: Semua data tersimpan di LocalStorage browser
2\. \*\*Backup Rutin\*\*: Lakukan backup data secara berkala
3\. \*\*Browser Compatibility\*\*: Aplikasi bekerja optimal di Chrome, Firefox, Safari, dan Edge modern
4\. \*\*Offline Mode\*\*: Aplikasi dapat digunakan tanpa koneksi internet

\## 🐶 Troubleshooting

\### Data Hilang
\- Data tersimpan di LocalStorage browser
\- Clear browser cache akan menghapus semua data
\- Selalu lakukan backup data secara berkala

\### Error Saat Input Transaksi
\- Pastikan semua field required terisi
\- Pastikan total debit sama dengan total kredit
\- Periksa konsol browser untuk detail error

\### Laporan Tidak Muncul
\- Pastikan ada transaksi pada periode yang dipilih
\- Periksa filter tanggal dan akun
\- Refresh halaman dan coba lagi

\## 📄 Lisensi

MIT License - Bebas digunakan dan dimodifikasi

\## 🤝 Kontribusi

1\. Fork repository
2\. Buat branch fitur baru
3\. Commit perubahan
4\. Push ke branch
5\. Buat Pull Request

\## 📞 Kontak

Untuk pertanyaan atau bantuan, silakan buka issue di repository.

