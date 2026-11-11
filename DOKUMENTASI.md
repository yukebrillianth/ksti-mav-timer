# Timer MAV KSTI 2026: Panduan Panitia

> Prosedur langkah demi langkah saat lomba (siapa menekan apa, kapan): lihat **[SOP.md](SOP.md)**.

Aplikasi timer untuk lomba Mini Autonomous Vehicle (2 lapangan). Ada dua tampilan:

| Tampilan | Alamat | Dipakai di |
|---|---|---|
| **Layar penonton** | `http://localhost:8080/` | TV/proyektor. Tanpa tombol, hanya info. |
| **Layar operator** | `http://localhost:8080/operator` | Laptop panitia. Semua kontrol ada di sini (pakai PIN). |

Semua perubahan dari operator (tunda, jeda, pengumuman, nama finalis) langsung muncul di semua layar penonton dalam hitungan milidetik. Timer dihitung di masing-masing layar, jadi kalau jaringan putus timer tetap jalan.

---

## 1. Persiapan (sekali saja, H-1)

1. **Pasang Node.js** versi **LTS** dari <https://nodejs.org> (Next, Next, Finish). Cukup sekali.
2. **Salin folder `mav-timer`** ke laptop, misalnya ke `Desktop`. Kalau dari file ZIP: klik kanan ZIP → *Properties* → centang **Unblock** → OK, baru *Extract All*.
3. **Klik dua kali `MULAI.bat`.**
   - Kalau muncul *"Windows protected your PC"*: klik **More info → Run anyway**.
   - Kalau muncul *Windows Defender Firewall*: centang **Private networks**, lalu **Allow access**. Tanpa ini, TV/HP lain tidak bisa tersambung.
4. Browser terbuka dua tab: **Operator** dan **Penonton**. Selesai.

> Jendela hitam bertuliskan *"JANGAN TUTUP jendela ini selama lomba"* adalah servernya. Kalau jendela itu ditutup, layar berhenti menerima perintah operator (timer tetap jalan dengan data terakhir). Selama jendela itu terbuka, laptop dan layar dijaga supaya tidak sleep.

---

## 2. Hari-H: memasang layar

### Cara paling aman: TV dicolok HDMI ke laptop yang sama

1. Colok HDMI → tekan **Windows + P** → pilih **Extend** (bukan Duplicate).
2. Klik dua kali **`MULAI.bat`**.
3. Seret jendela/tab **Penonton** ke layar TV, lalu **klik dua kali** di layar itu (atau tekan **F11**) supaya layar penuh.
4. Klik tombol kuning **"Klik untuk mengaktifkan suara"** di pojok kanan bawah layar penonton. Akan terdengar bunyi tes. Pastikan suara keluar dari speaker venue (*Sound settings → Output*).
5. Di layar laptop, buka tab **Operator**, lalu masukkan PIN (default `2026`, ganti di `config.json`).

Cara ini **tidak butuh Wi-Fi sama sekali**.

### Layar tambahan atau operator pakai HP

Jendela hitam menampilkan alamat seperti `http://192.168.1.10:8080/`. Buka alamat itu dari perangkat lain yang **berada di Wi-Fi yang sama**.

- Pakai **router/hotspot sendiri**. Wi-Fi kampus/hotel sering memblokir koneksi antar perangkat.
- Titik kecil di sebelah jam: **hijau** = tersambung, **merah** = terputus. Kalau terputus, layar akan menyambung sendiri begitu jaringan pulih.

### Checklist sebelum lomba dimulai

- [ ] Laptop dicolok charger, lid tidak ditutup.
- [ ] Jendela hitam server terbuka.
- [ ] Layar penonton layar penuh, titik di sebelah jam **hijau**.
- [ ] Suara sudah diaktifkan dan terdengar di speaker.
- [ ] **Tidak ada label ungu "SIMULASI"** di layar (kalau ada: operator → *Stop, kembali ke waktu nyata*).
- [ ] Jam di layar sama dengan jam asli (WIB).

---

## 3. Selama lomba: halaman operator

Setiap lapangan punya tombolnya sendiri. Jadwal lapangan A dan B bisa digeser terpisah.

| Tombol | Kapan dipakai | Efek |
|---|---|---|
| **−1 mnt / −10 dtk / +10 dtk / +1 mnt / +5 mnt** | Jadwal molor atau terlalu cepat | Seluruh jadwal lapangan itu bergeser |
| **Jeda / Lanjutkan** | Ada gangguan (robot macet, lapangan dibenahi) | Timer berhenti; lama jeda otomatis menjadi tunda |
| **Mulai berikutnya sekarang** | Tim siap lebih cepat | Kegiatan berikutnya langsung dimulai |
| **Ulang dari awal** | Race harus diulang | Kegiatan yang sedang berjalan diulang dari awal |
| **Reset** | Kembali ke jadwal Excel | Tunda dan jeda dihapus |
| **Kedua lapangan** | Sama seperti di atas, untuk A dan B sekaligus | |
| **Rundown lengkap → Mulai** | Lompat ke kegiatan mana pun | Kegiatan itu dimulai sekarang; sesudahnya ikut bergeser |
| **Stopwatch: Start / Lap / Stop / Batal lap / Reset & simpan** | Menghitung lap manual | Waktu race & jumlah lap tampil di layar penonton. **Tombol 1 = Lap A, 2 = Lap B** di keyboard. Reset & simpan memasukkan hasil ke tabel **Hasil stopwatch** |
| **Hasil stopwatch → Unduh CSV** | Rekap untuk juri | File `hasil-stopwatch.csv` (langsung rapi di Excel): tim, kegiatan, jumlah lap, total, waktu tiap lap |
| **Pengumuman** | Info untuk penonton | Banner berdenyut di atas layar penonton. Klik *Hapus* untuk menghilangkan |
| **Nama tim** | Setelah penyisihan selesai | Isi nama finalis untuk `TIM FINAL 1`, dst. Tersimpan otomatis |
| **Tampilan layar penonton** | Sesuaikan dengan ruangan | **Gelap** (cocok untuk proyektor) atau **Terang** (gaya its.ac.id) |

Pada rundown lengkap, jam atas = jadwal Excel dan jam bawah = perkiraan setelah digeser.

Semua pengaturan ini tersimpan di `state.json`. Kalau laptop restart, klik `MULAI.bat` lagi; tunda, pengumuman, dan nama finalis tetap ada.

---

### Stopwatch lap

- Waktu dicatat saat tombol ditekan di laptop operator (jam sudah disinkron ke server), jadi lag jaringan tidak menggeser hasil.
- Tim dan kegiatan (mis. *Race 2*) diambil otomatis dari jadwal lapangan itu saat **Start** ditekan.
- **Stop** lalu **Start** lagi = melanjutkan (waktu dijumlahkan), bukan mulai baru.
- Hasil tersimpan di `state.json` dan tidak hilang walau server di-restart. Menghapus `state.json` juga menghapus hasil stopwatch, jadi **unduh CSV dulu**.

## 4. Update rundown dari Excel

**Seret file Excel ke atas `UPDATE-RUNDOWN.bat`** (drag and drop). Muncul pertanyaan nama sheet: tekan **Enter** untuk sheet `MAV`, atau ketik nama sheet lain (misalnya `Belum Fix`) lalu Enter. Selesai.

Lewat terminal: `node tools\xlsx2csv.js "Rundown MAV.xlsx" --sheet="Belum Fix"`.

- Kalau server sedang jalan, semua layar langsung berganti, tanpa restart.
- Excel dicek dulu. Kalau ada yang salah, muncul pesan **GAGAL** dan jadwal lama tetap dipakai.
- Versi sebelumnya disimpan otomatis di `rundown.bak.csv`. Untuk membatalkan update: hapus `rundown.csv`, lalu ganti nama `rundown.bak.csv` menjadi `rundown.csv`.
- Kalau ada tim yang terjadwal di dua lapangan sekaligus, muncul peringatan, dan di halaman operator ada kotak kuning **"Periksa rundown"**.

### Format Excel yang dibaca

Sheet **`MAV`** (atau sheet lain yang dipilih saat update, dengan susunan kolom yang sama), mengikuti format rundown yang sudah ada:

| Kolom | Lapangan A | Lapangan B |
|---|---|---|
| Start | A | G |
| End | B | H |
| Keterangan | D | J |
| Nama Tim | E | K |

- Baris judul/header dilewati otomatis. Registrasi dan pembukaan (semua baris sebelum tim pertama) juga dilewati.
- **Nama tim cukup ditulis di baris "Persiapan"**; baris Race di bawahnya otomatis ikut tim tersebut.
- Tulis keterangan race beserta nomornya (**`Race 1`**, **`Race 2`**, **`Race 3`**); teks ini yang tampil di layar dan di hasil stopwatch.
- Nama tim yang beda huruf besar/kecil (`Wisanggeni` vs `WISANGGENI`) dianggap tim yang sama; yang dipakai ejaan pertama.
- Baris istirahat ditulis **`ISHOMA`**.
- Keterangan yang diawali **`Race`** dihitung sebagai race (warna merah, ada bunyi GO dan buzzer).
- Tim final ditulis `TIM FINAL 1`, dan babak challenge `TIM FINAL 1 CHALLENGE`; nama aslinya diisi lewat halaman operator.

### Yang dikoreksi otomatis (Excel tidak diubah)

- **Jam salah ketik 12 jam**: jam sebelum 07:00 dianggap siang (02:35 → 14:35).
- **Rumus Start Lapangan B** yang berisi `=B{baris}` (merujuk ke jam selesai Lapangan A) dihitung ulang dari kegiatan B sebelumnya. Sebaiknya rumus di Excel juga dibetulkan menjadi `=H{baris sebelumnya}`.

### Aturan jadwal

- Jadwal **sama persis dengan Excel**: `"swapSeconds": 0` di `config.json` (tidak ada jeda pergantian tim).
- Kalau rundown suatu saat butuh jeda pergantian (misalnya 30 detik), ubah menjadi `"swapSeconds": 30`. Jeda disisipkan setiap kali tim di lapangan berganti, dan layar menampilkan *"Masuk: [nama tim]"*. **ISHOMA tetap selesai sesuai jam Excel**, jadi jadwal setelah ISHOMA kembali sama dengan Excel.

---

## 5. Gladi / mencoba di luar jam lomba

Halaman operator → **Simulasi (uji coba)**:

1. Pilih jam mulai (misalnya `09:00`) dan kecepatan (**1x** untuk mencoba suara, **60x** = 1 detik untuk 1 menit).
2. **Mulai simulasi**. Semua layar ikut jam simulasi dan semua tombol operator tetap berfungsi.
3. Layar penonton menampilkan label ungu **SIMULASI**.
4. Selesai mencoba: **Stop, kembali ke waktu nyata**. Tunda dan jeda dikembalikan seperti sebelum simulasi.

Saran: lakukan gladi di lokasi dengan perangkat yang akan dipakai, simulasi 1x selama ±10 menit.

---

## 6. Suara

Suara hanya keluar dari **layar penonton**, setelah tombol aktifkan suara diklik.

| Momen | Bunyi |
|---|---|
| Persiapan / ISHOMA mulai | chime |
| 1 menit sebelum Persiapan selesai | ding-ding |
| 5 detik sebelum Race mulai | tik ×5 |
| Race mulai | GO |
| 5 detik terakhir Race | tik ×5 |
| Race selesai | buzzer |

Suara tidak berbunyi saat jadwal dilompati, dijeda, atau simulasi di atas 2x.

---

## 7. Masalah yang mungkin terjadi

| Gejala | Penyebab & solusi |
|---|---|
| Klik `MULAI.bat`, muncul "Node.js belum terpasang" | Pasang Node.js LTS dari <https://nodejs.org>, lalu klik lagi. |
| Jendela hitam langsung tertutup | Jalankan dari *Command Prompt* di folder ini: `node server.js`, lalu baca pesan errornya. |
| "Port 8080 sudah dipakai" | Server sudah jalan di jendela lain (tidak apa-apa, layarnya dibuka). Kalau dipakai aplikasi lain: ganti `"port"` di `config.json`. |
| TV/HP lain tidak bisa membuka alamat | Belum *Allow* di Windows Firewall, beda Wi-Fi, atau Wi-Fi memblokir antar perangkat. Pakai hotspot sendiri atau HDMI. |
| Titik di sebelah jam merah | Koneksi ke server putus. Cek jendela hitam masih terbuka; layar menyambung sendiri. |
| Tidak ada suara | Klik tombol aktifkan suara; cek output audio Windows dan volume. |
| Layar penonton terpotong | Tekan F11 / klik dua kali untuk layar penuh. Tampilan menyesuaikan ukuran layar otomatis. |
| PIN salah | Lihat `"operatorPin"` di `config.json`. |
| Ingin mulai dari bersih | Tutup server, hapus `state.json`, klik `MULAI.bat`. |
| Excel ditolak (GAGAL) | Baca pesannya: biasanya nama sheet salah ketik (huruf besar/kecil dan spasi harus sama), atau ada jam/kegiatan kosong. Nomor baris yang salah disebutkan. |

---

## 8. Pengaturan (`config.json`)

Buka dengan Notepad. Simpan, lalu tunggu ±1 detik; semua layar ikut berubah.

| Kunci | Arti |
|---|---|
| `title`, `subtitle` | Judul di layar |
| `operatorPin` | PIN halaman operator. **Ganti sebelum lomba.** |
| `port` | Port server (default 8080) |
| `swapSeconds` | Jeda pergantian tim, detik (0 = persis Excel) |
| `lanes` | Nama lapangan |
| `teams` | Nama pengganti, mis. `"TIM FINAL 1": "IRIS"` (bisa juga lewat halaman operator) |

---

## 9. Isi folder

| File | Fungsi |
|---|---|
| `MULAI.bat` | Klik dua kali untuk menjalankan |
| `UPDATE-RUNDOWN.bat` | Seret Excel ke sini untuk update jadwal |
| `rundown.csv` | Jadwal yang dipakai (hasil konversi Excel; bisa dibuka di Excel) |
| `config.json` | Pengaturan |
| `state.json` | Dibuat otomatis: tunda, jeda, pengumuman, nama finalis |
| `server.js`, `public/`, `tools/` | Program (tidak perlu diubah) |
| `test.js` | Tes otomatis: `node --test test.js` |

### Untuk pengembang

- Tanpa dependency npm. Node.js 18+.
- `server.js`: HTTP + Server-Sent Events, membaca `rundown.csv` & `config.json` dan memantau perubahan file.
- `public/common.js`: logika timer bersama; `display.html` (penonton), `operator.html` (operator), `sound.js` (suara Web Audio).
- `tools/xlsx2csv.js`: pembaca `.xlsx` tanpa library.
- `tools/jalankan.ps1`: dipanggil `MULAI.bat`; mencegah sleep selama server jalan.
- Mode pratinjau lokal (tanpa mengubah layar lain): tambahkan `?t=11:35&speed=60` di alamat. Tema satu layar: `?tema=terang` / `?tema=gelap`.
- Di macOS/Linux: `node server.js --buka` (Mac: `caffeinate -dims node server.js` supaya tidak sleep).
