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

## F. Pergantian ke Babak Final

1. Setelah penyisihan selesai dan finalis diumumkan juri: halaman operator → **Nama tim**.
2. Isi nama asli untuk `TIM FINAL 1/2/3` dan `TIM FINAL 1/2/3 CHALLENGE` (urutan sesuai keputusan juri). Nama tersimpan otomatis dan langsung tampil di layar.
3. Cek ulang di layar penonton bahwa nama di kartu lapangan sudah benar.
4. Opsional: pengumuman *"Babak Final dimulai pukul 16:00"*.

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
