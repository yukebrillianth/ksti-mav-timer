# Timer MAV · KSTI 2026

Dua layar dari satu laptop operator. Butuh **Node.js 18+** saja (tanpa `npm install`, tanpa internet).

```bash
caffeinate -dims node server.js     # caffeinate = Mac tidak tidur selama server jalan
```

Terminal menampilkan alamatnya, misal `http://192.168.1.10:8080`.

| Layar | Alamat | Untuk |
|---|---|---|
| Penonton | `http://<ip>:8080/` | TV/proyektor. Klik dua kali = layar penuh. |
| Operator | `http://<ip>:8080/operator` | Laptop/HP panitia. PIN ada di `config.json`. |

Semua perangkat harus di Wi-Fi/LAN yang sama. Kalau koneksi putus, layar penonton tetap menghitung dengan data terakhir (titik di sebelah jam jadi merah).

## File yang boleh diedit

- **`rundown.csv`**: jadwal. Buka di Excel/Google Sheets, kolom `lapangan,mulai,selesai,kegiatan,tim,babak`. Simpan, dan semua layar ikut berubah dalam ±1 detik. Kalau ada salah ketik, layar tetap memakai data lama dan operator melihat pesan error beserta nomor barisnya. Jeda pergantian tim 30 detik disisipkan otomatis, jadi jangan ditulis di CSV.
- **`config.json`**: judul, PIN operator, port, `swapSeconds`, nama lapangan, dan nama finalis (`"TIM FINAL 1": "IRIS"`). Nama finalis juga bisa diisi langsung dari halaman operator.
- `state.json`: dibuat otomatis (tunda, jeda, pengumuman, nama). Hapus untuk mulai bersih.

Rundown asli dari Excel (`Rundown MAV.xlsx`, sheet `MAV`) sudah dikonversi oleh `tools/xlsx2csv.py`, sekaligus mengoreksi bug di Excel (jam salah ketik 02:35 → 14:35, rumus Start Lapangan B, ISHOMA 1 jadi 11:30–12:00).

## Checklist hari-H (koneksi)

Timer dihitung **di masing-masing layar**, bukan dikirim per detik dari server. Server hanya mengirim perubahan (tunda, jeda, pengumuman) dan sinkron jam tiap 10 detik. Hasil ukur: klik operator sampai di layar dalam 3–25 ms, dan selisih antar layar ~30 ms.

1. **Paling aman: TV/proyektor dicolok HDMI ke laptop server** (layar diperluas, bukan mirror). Buka `http://localhost:8080/` di layar TV, dan operator di layar laptop. Cara ini tidak butuh jaringan sama sekali.
2. Kalau ada layar lain atau HP operator: pakai **router/hotspot sendiri**. Wi-Fi kampus/hotel sering memblokir koneksi antar perangkat (*client isolation*), sehingga layar tidak bisa tersambung.
3. Saat `node server.js` pertama kali jalan, macOS bertanya soal koneksi masuk: pilih **Allow**. (Firewall di laptop ini aktif.)
4. Laptop server: colok charger, **jangan tutup lid**, dan jalankan dengan `caffeinate` (lihat atas).
5. Di layar penonton, titik di sebelah jam harus **hijau**. Kalau merah, timer tetap jalan dengan data terakhir, tapi perintah operator tidak sampai. Layar akan menyambung sendiri begitu jaringan pulih.
6. Server sempat mati/restart? Jalankan lagi saja. Tunda, jeda, pengumuman, dan nama finalis tersimpan di `state.json`.
7. Pastikan **simulasi sudah di-Stop** (tidak ada label ungu SIMULASI).

## Suara (layar penonton)

Klik tombol kuning **"Klik untuk mengaktifkan suara"** sekali setelah layar dibuka (aturan browser), lalu chime tes akan berbunyi. Pastikan output audio laptop mengarah ke speaker venue.

| Momen | Suara |
|---|---|
| Persiapan / ISHOMA mulai | chime |
| 1 menit sebelum Persiapan selesai | ding-ding |
| 5 detik sebelum Race mulai & 5 detik terakhir Race | tik ×5 |
| Race mulai | GO |
| Race selesai | buzzer |

Suara tidak berbunyi saat jadwal dilompati, dijeda, atau simulasi di atas 2x. Untuk mencoba suara, pakai simulasi **1x**.

## Saat lomba (halaman operator)

- **Geser** (−1 mnt … +5 mnt): jadwal lapangan itu mundur/maju.
- **Jeda / Lanjutkan**: timer berhenti, dan waktu jeda otomatis jadi tunda.
- **Mulai berikutnya sekarang**: tim siap lebih cepat? Kegiatan berikutnya langsung dimulai.
- **Ulang dari awal**: kegiatan yang sedang berjalan diulang (misal robot restart).
- **Rundown lengkap → Mulai**: lompat ke kegiatan mana pun.
- **Pengumuman**: teks kuning di layar penonton.
- **Simulasi**: coba alur lomba di jam berapa pun (misal 09:00, 60x). Semua layar ikut dan berlabel SIMULASI. **Klik Stop sebelum lomba dimulai.** Tunda/jeda asli dikembalikan.

## Tes

```bash
node --test test.js
```
