#!/usr/bin/env python3
"""Konversi sekali jalan: sheet 'MAV' di Rundown MAV.xlsx -> rundown.csv (dibaca server.js).
Pakai: pip install openpyxl ; python3 tools/xlsx2csv.py "Rundown MAV.xlsx" > rundown.csv
Koreksi bug sumber (Excel aslinya tidak diubah):
  - jam < 07:00 = salah ketik 12 jam (02:35 -> 14:35)
  - Start Lapangan B berisi =B{baris} (selesai Lapangan A) -> dirantai dari kegiatan B sebelumnya
  - ISHOMA 1 dikunci 11:30-12:00 (keputusan panitia)
Jeda pergantian tim 30 dtk TIDAK ditulis di sini; server menyisipkannya otomatis (config.json: swapSeconds).
"""
import sys, datetime, openpyxl

XLSX = sys.argv[1] if len(sys.argv) > 1 else 'Rundown MAV.xlsx'
START_ROW, ISHOMA1 = 6, ('11:30', '12:00')
cols = {'A': ('A', 'B', 'D', 'E'), 'B': ('G', 'H', 'J', 'K')}   # start, end, keterangan, tim

def sec(v): s = v.hour * 3600 + v.minute * 60; return s + 12 * 3600 if s < 7 * 3600 else s
def S(x): h, m = x.split(':'); return int(h) * 3600 + int(m) * 60
def H(s): return '%02d:%02d' % (s // 3600, s % 3600 // 60)
def babak(team, prev):
    if not team: return prev
    return 'Final Challenge' if team.upper().endswith('CHALLENGE') else 'Final' if team.upper().startswith('TIM FINAL') else 'Penyisihan'

ws = openpyxl.load_workbook(XLSX, data_only=True)['MAV']
wf = openpyxl.load_workbook(XLSX)['MAV']
print('lapangan,mulai,selesai,kegiatan,tim,babak')
for k, (cs, ce, cl, ct) in cols.items():
    last_team, last_end, ph, n_ish = None, None, 'Penyisihan', 0
    for r in range(START_ROW, ws.max_row + 1):
        s, e, l, tm = (ws[f'{c}{r}'].value for c in (cs, ce, cl, ct))
        if not isinstance(s, datetime.time) or not l: continue
        l, tm = l.strip(), (tm or '').strip() or None
        s0, e0 = sec(s), sec(e)
        if k == 'B' and last_end is not None and str(wf[f'G{r}'].value).replace(' ', '') == f'=B{r}':
            s0, e0 = last_end, last_end + (e0 - s0)
        if l.upper() == 'ISHOMA':
            n_ish += 1; tm = last_team = None; l = f'ISHOMA {n_ish}'
            if n_ish == 1: s0, e0 = S(ISHOMA1[0]), S(ISHOMA1[1])
        elif tm: last_team = tm
        else: tm = last_team            # nama tim hanya ditulis di baris Persiapan
        ph = babak(tm, ph)
        last_end = e0
        print(','.join([k, H(s0), H(e0), l, f'"{tm}"' if tm and ',' in tm else (tm or ''), ph]))
