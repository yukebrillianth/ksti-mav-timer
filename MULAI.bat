@echo off
rem Klik dua kali untuk menjalankan Timer MAV. Jendela ini harus tetap terbuka selama lomba.
chcp 65001 >nul
title Timer MAV KSTI 2026 - JANGAN DITUTUP
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto nonode
where powershell >nul 2>nul
if errorlevel 1 goto plain
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\jalankan.ps1"
goto end
:plain
node server.js --buka
goto end
:nonode
echo.
echo   Node.js belum terpasang di laptop ini.
echo   1. Pasang versi LTS dari https://nodejs.org  (Next, Next, Finish)
echo   2. Klik MULAI.bat lagi.
echo.
start "" https://nodejs.org/
:end
echo.
pause
