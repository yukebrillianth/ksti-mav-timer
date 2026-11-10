# Timer MAV · KSTI 2026

Timer lomba Mini Autonomous Vehicle (2 lapangan): layar penonton untuk TV/proyektor, layar operator untuk panitia.

- **Windows:** pasang [Node.js LTS](https://nodejs.org), lalu klik dua kali **`MULAI.bat`**.
- **Update jadwal:** seret file Excel rundown ke atas **`UPDATE-RUNDOWN.bat`**.

- **[Guidebook-Timer-MAV-KSTI-2026.pdf](Guidebook-Timer-MAV-KSTI-2026.pdf)**: SOP + panduan teknis dalam satu PDF untuk dibagikan/dicetak. Buat ulang setelah mengubah markdown: `node tools/guidebook.mjs` (butuh pandoc + Chrome).
- **[SOP.md](SOP.md)**: prosedur panitia saat lomba (peran, H-1, hari-H, kejadian khusus, final).
- **[DOKUMENTASI.md](DOKUMENTASI.md)**: panduan lengkap (setup, tombol operator, format Excel, troubleshooting).

Tes: `node --test test.js`
