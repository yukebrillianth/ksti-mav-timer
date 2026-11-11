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

Setiap slot di lapangan = **Persiapan 10 menit → Race 5 menit** untuk satu tim. Layar menampilkan race ke berapa (*Race 1/2/3*). Tiap tim main 3 kali dan **berpindah lapangan** antar-race (misalnya Race 1 di A, Race 2 di B, Race 3 di A; lihat [Lampiran](#lampiran-jadwal-per-tim)). Tidak ada jeda pergantian: begitu race selesai, Persiapan tim berikutnya langsung berjalan, jadi Koordinator memanggil tim berikutnya (lihat *Berikutnya* di layar) **sebelum** race selesai.

1. **Persiapan (10 menit):** bunyi *ding-ding* saat sisa 1 menit, lalu **tik ×5** di 5 detik terakhir.
2. **Race (5 menit):** bunyi **GO** saat mulai; **tik ×5** di 5 detik terakhir; **buzzer** saat selesai.
3. **Stopwatch lap** (Operator, di kartu lapangan yang sama):
   - Robot mulai jalan → **Start**.
   - Robot melewati garis lap → tekan tombol **1** di keyboard (Lapangan A) atau **2** (Lapangan B), atau klik **Lap**. Keyboard lebih presisi daripada mouse.
   - Salah tekan → **Batal lap**.
   - Robot finis / race selesai → **Stop**.
   - Setelah race → **Reset & simpan**. Hasil (tim, race ke berapa, jumlah lap, waktu per lap) masuk ke tabel **Hasil stopwatch**.

   Penonton melihat **Waktu race** dan jumlah lap di panel lapangan.

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
| **Lupa menekan Start stopwatch** | Tekan **Start** secepatnya dan beri tahu juri selisihnya; stopwatch tidak bisa dimundurkan. |
| **Hasil stopwatch salah / dobel** | Tabel **Hasil stopwatch** → **Hapus** pada baris itu. |
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

Jam yang tertulis adalah jam **Race**; Persiapan 10 menit sebelumnya di lapangan yang sama.


| Tim | Race 1 | Race 2 | Race 3 |
|---|---|---|---|
| TIM FINAL 1 | A 16:10–16:15 | B 16:30–16:35 | A 16:55–17:00 |
| TIM FINAL 2 | B 16:15–16:20 | A 16:40–16:45 | B 17:00–17:05 |
| TIM FINAL 3 | A 16:25–16:30 | B 16:45–16:50 | A 17:10–17:15 |

**Final Challenge** (semua di Lapangan B):

| Tim | Race 1 | Race 2 | Race 3 |
|---|---|---|---|
| TIM FINAL 1 CHALLENGE | B 17:15–17:20 | B 17:30–17:35 | B 17:45–17:50 |
| TIM FINAL 2 CHALLENGE | B 18:00–18:05 | B 18:15–18:20 | B 18:30–18:35 |
| TIM FINAL 3 CHALLENGE | B 18:45–18:50 | B 19:00–19:05 | B 19:15–19:20 |

Final berpindah lapangan antar-race (A ↔ B). Final Challenge seluruhnya di **Lapangan B**, sementara Lapangan A selesai pukul 17:15.

### F2. Langkah setelah penyisihan selesai (saat ISHOMA 2, 15:30–16:00)

1. Juri menyerahkan **urutan finalis** ke Operator, dalam bentuk: Final 1 = …, Final 2 = …, Final 3 = …, dan Challenge 1/2/3 = ….
2. Halaman operator → bagian **Nama tim** → isi kolom:
   - `TIM FINAL 1`, `TIM FINAL 2`, `TIM FINAL 3`
   - `TIM FINAL 1 CHALLENGE`, `TIM FINAL 2 CHALLENGE`, `TIM FINAL 3 CHALLENGE`

   Kalau peserta Challenge sama dengan finalis, isi dengan nama yang sama. Nama tersimpan saat pindah kolom (Tab/klik di luar) dan langsung tampil di semua layar.
3. **Cek ulang di layar penonton**: tabel *Semua tim* dan kartu lapangan sudah menampilkan nama asli. Salah ketik? Perbaiki di kolom yang sama.
4. Koordinator Lapangan A dan B mencatat siapa main di lapangannya (tabel F1).
5. Opsional: pengumuman *"Babak Final dimulai pukul 16:00"*.

### F3. Hal yang perlu diperhatikan

- **Finalis pindah lapangan dengan cepat**: misalnya TIM FINAL 1 selesai Race 1 di A pukul 16:15, lalu Persiapan Race 2 di B mulai 16:20. Hanya ±5 menit untuk pindah. Koordinator A dan B saling mengabari.
- **Finalis 1 ikut Challenge 1**: Race 3 Final di Lapangan A selesai **17:00**, Persiapan Challenge 1 di Lapangan B mulai **17:05**.
- Kalau satu lapangan molor, lapangan lain **tidak ikut mundur otomatis** (jadwal tiap lapangan berdiri sendiri). Tunggu timnya: tekan **Jeda** atau **+1 mnt** di lapangan yang menunggu sampai tim siap.
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

1. Halaman operator → **Hasil stopwatch** → **Unduh CSV (Excel)**, serahkan ke juri/sekretariat.
2. Hapus pengumuman (atau tampilkan *"Terima kasih"*).
3. Tutup jendela hitam server (atau tekan **Ctrl + C**).
4. Untuk dipakai lagi dari awal (lomba/gladi berikutnya): hapus `state.json` sebelum menjalankan `MULAI.bat`.

---

## Lampiran: jadwal per tim

Jam **Race** tiap tim beserta lapangannya (A/B). Persiapan 10 menit sebelum race, di lapangan yang sama. Dihitung dari rundown saat ini; kalau rundown di-update, jadwal terkini selalu ada di halaman operator → **Rundown lengkap**. Jam bisa bergeser kalau Operator menunda atau menjeda.

### Penyisihan

| Tim | Race 1 | Race 2 | Race 3 |
|---|---|---|---|
| Bertuah Punya Budak! | A 09:10–09:15 | B 11:00–11:05 | A 13:40–13:45 |
| ARC 2 | B 09:15–09:20 | A 11:10–11:15 | B 13:45–13:50 |
| Aetherion | A 09:25–09:30 | B 11:15–11:20 | A 13:55–14:00 |
| Arc 1 | B 09:30–09:35 | A 12:10–12:15 | B 14:00–14:05 |
| Ledrek | A 09:40–09:45 | B 12:15–12:20 | A 14:10–14:15 |
| WISANGGENI | B 09:45–09:50 | A 12:25–12:30 | B 14:15–14:20 |
| Mochamad Syamsul Huda Ramdani | A 09:55–10:00 | B 12:30–12:35 | A 14:25–14:30 |
| Doa_ibu-Ibu | B 10:00–10:05 | A 12:40–12:45 | B 14:30–14:35 |
| Jrevo Unej | A 10:10–10:15 | B 12:45–12:50 | A 14:40–14:45 |
| Espyro | B 10:15–10:20 | A 12:55–13:00 | B 14:45–14:50 |
| IRIS | A 10:25–10:30 | B 13:00–13:05 | A 14:55–15:00 |
| Mizuro Um | B 10:30–10:35 | A 13:10–13:15 | B 15:00–15:05 |
| Erucokro Team | A 10:40–10:45 | B 13:15–13:20 | A 15:10–15:15 |
| Krakatau Taurus | B 10:45–10:50 | A 13:25–13:30 | B 15:15–15:20 |
| Abhinaya | A 10:55–11:00 | B 13:30–13:35 | A 15:25–15:30 |

### Final

| Tim | Race 1 | Race 2 | Race 3 |
|---|---|---|---|
| TIM FINAL 1 | A 16:10–16:15 | B 16:30–16:35 | A 16:55–17:00 |
| TIM FINAL 2 | B 16:15–16:20 | A 16:40–16:45 | B 17:00–17:05 |
| TIM FINAL 3 | A 16:25–16:30 | B 16:45–16:50 | A 17:10–17:15 |

### Final Challenge

| Tim | Race 1 | Race 2 | Race 3 |
|---|---|---|---|
| TIM FINAL 1 CHALLENGE | B 17:15–17:20 | B 17:30–17:35 | B 17:45–17:50 |
| TIM FINAL 2 CHALLENGE | B 18:00–18:05 | B 18:15–18:20 | B 18:30–18:35 |
| TIM FINAL 3 CHALLENGE | B 18:45–18:50 | B 19:00–19:05 | B 19:15–19:20 |

ISHOMA 1: 11:20–12:00. ISHOMA 2: 15:30–16:00. Kedua lapangan sama, sesuai Excel.
