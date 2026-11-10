# SOP Timer MAV KSTI 2026

Prosedur penggunaan timer saat lomba. Detail teknis, format Excel, dan troubleshooting ada di [DOKUMENTASI.md](DOKUMENTASI.md).

## Peran

| Peran | Jumlah | Tugas |
|---|---|---|
| **Operator Timer** | 1 | Memegang laptop server dan halaman operator. Satu-satunya yang menekan tombol. |
| **PJ Layar & Suara** | 1 | TV/proyektor, layar penuh, speaker. |
| **Koordinator Lapangan A / B** | 1 per lapangan | Memberi tahu Operator kondisi lapangan: tim siap, tim belum siap, race diulang, dll. |

**Aturan utama:** hanya Operator Timer yang menekan tombol. Koordinator lapangan menyampaikan lewat HT/WA dengan format: **"Lapangan [A/B], [kejadian], [tim]"**, misalnya *"Lapangan A, tim Ledrek belum siap."*

Sepakati dengan juri sebelum lomba: timer ini menjadi acuan **jadwal** (kapan persiapan dan race dimulai/selesai). Bunyi **GO** menandai race dimulai dan **buzzer** menandai race selesai.

---

## A. H-1: Persiapan

| # | Langkah | PJ |
|---|---|---|
| 1 | Pasang Node.js LTS di laptop server, salin folder `mav-timer`. | Operator |
| 2 | Seret Excel rundown **final** ke `UPDATE-RUNDOWN.bat`. Pastikan muncul **OK** dan tidak ada peringatan bentrok. | Operator |
| 3 | Ganti `operatorPin` di `config.json`. Catat PIN dan berikan hanya ke Operator (dan cadangannya). | Operator |
| 4 | Klik `MULAI.bat`. Saat muncul Windows Firewall, pilih **Allow**. | Operator |
| 5 | Gladi dengan **Simulasi 1x** dari jam 09:00 selama ±10 menit. Coba tombol Jeda, +1 mnt, Mulai berikutnya, Pengumuman. Dengarkan suaranya. | Operator + PJ Layar |
| 6 | **Stop simulasi**, lalu **Reset** kedua lapangan. | Operator |
| 7 | Cek HDMI ke TV/proyektor di lokasi, pilih tema (Gelap/Terang) yang paling jelas di ruangan itu. | PJ Layar |

---

## B. Hari-H: sebelum lomba (mulai ≥ 30 menit sebelum 09:00)

| # | Langkah | PJ |
|---|---|---|
| 1 | Laptop dicolok charger. Jangan tutup lid. | Operator |
| 2 | Colok HDMI → **Windows + P → Extend**. | PJ Layar |
| 3 | Klik dua kali `MULAI.bat`. Biarkan jendela hitam terbuka sampai lomba selesai. | Operator |
| 4 | Pindahkan tab **Penonton** ke TV, klik dua kali (layar penuh). | PJ Layar |
| 5 | Klik **"Klik untuk mengaktifkan suara"**, pastikan bunyi tes terdengar di speaker. | PJ Layar |
| 6 | Di tab **Operator**, masukkan PIN. | Operator |
| 7 | Cek: titik di sebelah jam **hijau**, **tidak ada label SIMULASI**, jam di layar = jam HP (WIB). | Operator + PJ Layar |
| 8 | Cek kartu lapangan A & B: tim pertama sudah benar sesuai rundown. | Operator |
| 9 | Kalau upacara pembukaan molor: tekan **+1 / +5 mnt** di **Kedua lapangan** sampai jadwal pas, atau tunggu, lalu gunakan **Rundown lengkap → Mulai** pada Persiapan pertama tepat saat tim pertama masuk lapangan. | Operator |

---

## C. Selama lomba: siklus setiap tim

Timer berjalan sendiri mengikuti rundown. **Dalam kondisi normal Operator tidak perlu menekan apa pun.**

1. **Pergantian tim (30 detik):** layar menampilkan *"Masuk: [nama tim]"*. Koordinator memanggil tim berikutnya.
2. **Persiapan (10 menit):** bunyi *ding-ding* saat sisa 1 menit, lalu **tik ×5** di 5 detik terakhir.
3. **Race (5 menit):** bunyi **GO** saat mulai; **tik ×5** di 5 detik terakhir; **buzzer** saat selesai.
4. Ulangi untuk Race 2 dan Race 3.

Operator memantau dua hal: **pesan dari koordinator** dan **kotak "Mundur X mnt"** di kartu lapangan (artinya jadwal lapangan itu sedang tergeser).

---

## D. Kejadian khusus: apa yang ditekan

Semua tombol ada di kartu lapangan yang bersangkutan (A atau B).

| Kejadian | Tindakan Operator |
|---|---|
| **Tim belum siap** saat Persiapan hampir habis | Tekan **+1 mnt** (bisa berkali-kali), atau **Jeda** lalu **Lanjutkan** saat tim siap. |
| **Tim siap lebih cepat**, ingin langsung race | **Mulai berikutnya sekarang** (saat Persiapan berjalan → Race langsung mulai). |
| **Race harus diulang** (gangguan lapangan, keputusan juri) | Saat race masih berjalan: **Ulang dari awal**. |
| **Gangguan di lapangan** (lampu, lintasan rusak, dll.) | **Jeda**. Setelah beres: **Lanjutkan**. Lama jeda otomatis jadi tunda. |
| **Tim tidak hadir / mengundurkan diri** | **Rundown lengkap** → cari Persiapan tim berikutnya di lapangan itu → **Mulai**. |
| **Timer salah sedikit** (beberapa detik) | **−10 dtk / +10 dtk**. |
| **Kedua lapangan terhenti** (mis. pengumuman panitia) | Bagian **Kedua lapangan** → **Jeda semua**, lalu **Lanjut semua**. |
| **Perlu menyampaikan info ke penonton** | Isi **Pengumuman** → **Tampilkan**. Setelah tidak relevan: **Hapus**. |
| **Salah tekan** | Koreksi dengan tombol geser (−/+). Jangan tekan **Reset** saat lomba berjalan kecuali yakin; Reset mengembalikan lapangan ke jam Excel. |

Setiap tombol penting meminta konfirmasi. Baca nama lapangan dan tim di kotak konfirmasi sebelum klik OK.

---

## E. ISHOMA

1. ISHOMA berjalan otomatis sesuai jam Excel. Layar menampilkan hitung mundur ISHOMA.
2. **Kalau jadwal sudah mundur** (ada kotak "Mundur X mnt") dan panitia ingin kembali ke jadwal Excel setelah ISHOMA:
   - Tekan **Reset** di lapangan itu **selama ISHOMA masih berjalan** (sebelum jam selesai ISHOMA di Excel).
   - Pastikan tim pertama setelah ISHOMA bisa siap tepat waktu.
3. Bisa ditambahkan pengumuman, misalnya *"Lomba dilanjutkan pukul 12:00"*.

---

## F. Babak Final dan Final Challenge

Di rundown, finalis masih ditulis sebagai kode **`TIM FINAL 1/2/3`** dan **`TIM FINAL 1/2/3 CHALLENGE`**. Nama aslinya diisi Operator setelah juri mengumumkan finalis. Rundown/Excel **tidak perlu diubah**.

### F1. Urutan Final (sesuai rundown)

| Babak | Kode | Lapangan | Persiapan 1 | Selesai |
|---|---|---|---|---|
| Final | TIM FINAL 1 | A | 16:00 | 16:45 |
| Final | TIM FINAL 2 | B | 16:05 | 16:50 |
| Final | TIM FINAL 3 | A | 16:45:30 | 17:30:30 |
| Final Challenge | TIM FINAL 1 CHALLENGE | B | 16:50:30 | 17:35:30 |
| Final Challenge | TIM FINAL 2 CHALLENGE | B | 17:36 | 18:21 |
| Final Challenge | TIM FINAL 3 CHALLENGE | B | 18:21:30 | 19:06:30 |

Setiap tim: Persiapan 10 menit → Race 5 menit, sebanyak 3 kali. Semua Final Challenge di **Lapangan B**. Jadwal lengkap per tim ada di [Lampiran](#lampiran-jadwal-per-tim).

### F2. Langkah setelah penyisihan selesai (saat ISHOMA 2, 15:45–16:00)

1. Juri menyerahkan **urutan finalis** ke Operator, dalam bentuk: Final 1 = …, Final 2 = …, Final 3 = …, dan Challenge 1/2/3 = ….
2. Halaman operator → bagian **Nama tim** → isi kolom:
   - `TIM FINAL 1`, `TIM FINAL 2`, `TIM FINAL 3`
   - `TIM FINAL 1 CHALLENGE`, `TIM FINAL 2 CHALLENGE`, `TIM FINAL 3 CHALLENGE`

   Kalau peserta Challenge sama dengan finalis, isi dengan nama yang sama. Nama tersimpan saat pindah kolom (Tab/klik di luar) dan langsung tampil di semua layar.
3. **Cek ulang di layar penonton**: tabel *Semua tim* dan kartu lapangan sudah menampilkan nama asli. Salah ketik? Perbaiki di kolom yang sama.
4. Koordinator Lapangan A dan B mencatat siapa main di lapangannya (tabel F1).
5. Opsional: pengumuman *"Babak Final dimulai pukul 16:00"*.

### F3. Hal yang perlu diperhatikan

- **Finalis 1 ikut Challenge 1**: selesai di Lapangan A pukul **16:45**, lalu Persiapan Challenge di Lapangan B pukul **16:50:30**. Hanya ada ±5 menit untuk pindah lapangan. Koordinator A langsung mengarahkan tim ke Lapangan B.
- Kalau Final di Lapangan A molor, Challenge 1 di Lapangan B **tidak ikut mundur otomatis** (jadwal tiap lapangan berdiri sendiri). Tunggu timnya: tekan **Jeda** atau **+1 mnt** di Lapangan B sampai tim siap.
- Kalau finalis tidak sampai 3 tim, atau ada Challenge yang ditiadakan: gunakan **Rundown lengkap → Mulai** untuk melompati slot itu, atau minta pengelola rundown menghapus barisnya di Excel lalu jalankan `UPDATE-RUNDOWN.bat`.
- Nama di kolom *Nama tim* juga bisa dikosongkan untuk kembali menampilkan kode (`TIM FINAL 1`, dst.).
- Di tabel *Semua tim*, finalis yang juga ikut Challenge tampil **dua baris** (Final dan Challenge). Ini normal.

---

## G. Jika terjadi masalah teknis

| Masalah | Tindakan |
|---|---|
| Titik di sebelah jam **merah** | Timer tetap jalan. Cek jendela hitam server masih terbuka dan kabel/Wi-Fi tersambung. Layar menyambung sendiri. |
| Jendela server tertutup / laptop restart | Klik `MULAI.bat` lagi. Tunda, pengumuman, dan nama finalis tidak hilang. Cek ulang timer dengan jadwal. |
| Layar penonton blank / keluar dari layar penuh | Refresh (**F5**), klik dua kali untuk layar penuh, aktifkan suara lagi. |
| Suara hilang | Klik tombol suara di layar penonton; cek volume & output audio Windows. |
| Rundown perlu diubah saat lomba | Edit Excel → seret ke `UPDATE-RUNDOWN.bat`. Layar ikut berubah dalam ±1 detik. Lakukan hanya jika benar-benar perlu, sebaiknya saat ISHOMA. |

---

## H. Selesai lomba

1. Hapus pengumuman (atau tampilkan *"Terima kasih"*).
2. Tutup jendela hitam server (atau tekan **Ctrl + C**).
3. Untuk dipakai lagi dari awal (lomba/gladi berikutnya): hapus `state.json` sebelum menjalankan `MULAI.bat`.

---

## Lampiran: jadwal per tim

Dihitung dari rundown saat ini (sudah termasuk jeda pergantian tim 30 detik). Kalau rundown di-update, jadwal terkini selalu ada di halaman operator → **Rundown lengkap**. Jam bisa bergeser kalau Operator menunda atau menjeda.

### Penyisihan

| Lap. | Tim | Persiapan 1 | Race 1 | Race 2 | Race 3 | Selesai |
|---|---|---|---|---|---|---|
| A | Bertuah Punya Budak! | 09:00 | 09:10 | 09:25 | 09:40 | 09:45 |
| B | Arc 2 | 09:05 | 09:15 | 09:30 | 09:45 | 09:50 |
| A | Aetherion | 09:45:30 | 09:55:30 | 10:10:30 | 10:25:30 | 10:30:30 |
| B | Arc 1 | 09:50:30 | 10:00:30 | 10:15:30 | 10:30:30 | 10:35:30 |
| A | Ledrek | 10:31 | 10:41 | 10:56 | 11:11 | 11:16 |
| B | WISANGGENI | 10:36 | 10:46 | 11:01 | 11:16 | 11:21 |
| A | Mochamad Syamsul Huda Ramdani | 12:00 | 12:10 | 12:25 | 12:40 | 12:45 |
| B | Doa_ibu-Ibu | 12:05 | 12:15 | 12:30 | 12:45 | 12:50 |
| A | Jrevo Unej | 12:45:30 | 12:55:30 | 13:10:30 | 13:25:30 | 13:30:30 |
| B | Espyro | 12:50:30 | 13:00:30 | 13:15:30 | 13:30:30 | 13:35:30 |
| A | IRIS | 13:31 | 13:41 | 13:56 | 14:11 | 14:16 |
| B | Mizuro Um | 13:36 | 13:46 | 14:01 | 14:16 | 14:21 |
| A | Erucokro Team | 14:16:30 | 14:26:30 | 14:41:30 | 14:56:30 | 15:01:30 |
| B | Krakatau Taurus | 14:21:30 | 14:31:30 | 14:46:30 | 15:01:30 | 15:06:30 |
| A | Abhinaya | 15:02 | 15:12 | 15:27 | 15:42 | 15:47 |

### Final

| Lap. | Tim | Persiapan 1 | Race 1 | Race 2 | Race 3 | Selesai |
|---|---|---|---|---|---|---|
| A | TIM FINAL 1 | 16:00 | 16:10 | 16:25 | 16:40 | 16:45 |
| B | TIM FINAL 2 | 16:05 | 16:15 | 16:30 | 16:45 | 16:50 |
| A | TIM FINAL 3 | 16:45:30 | 16:55:30 | 17:10:30 | 17:25:30 | 17:30:30 |

### Final Challenge

| Lap. | Tim | Persiapan 1 | Race 1 | Race 2 | Race 3 | Selesai |
|---|---|---|---|---|---|---|
| B | TIM FINAL 1 CHALLENGE | 16:50:30 | 17:00:30 | 17:15:30 | 17:30:30 | 17:35:30 |
| B | TIM FINAL 2 CHALLENGE | 17:36 | 17:46 | 18:01 | 18:16 | 18:21 |
| B | TIM FINAL 3 CHALLENGE | 18:21:30 | 18:31:30 | 18:46:30 | 19:01:30 | 19:06:30 |

ISHOMA 1: 11:20–12:00 (Lapangan B mulai 11:21). ISHOMA 2: 15:45–16:00 (Lapangan A mulai 15:47). Mulai sedikit lebih lambat karena jeda pergantian tim; selesainya tetap sesuai Excel.
