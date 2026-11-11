@echo off
rem Seret (drag and drop) file Excel rundown ke atas file ini.
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto nonode
if "%~1"=="" goto usage
echo.
set "SHEET=MAV"
set /p "SHEET=  Nama sheet Excel (Enter = MAV): "
node tools\xlsx2csv.js "%~1" "--sheet=%SHEET%"
if errorlevel 1 goto end
echo.
echo   Kalau server sedang jalan, semua layar sudah ikut berubah (tidak perlu restart).
goto end
:usage
echo.
echo   Cara pakai: SERET file Excel rundown ke atas file UPDATE-RUNDOWN.bat ini.
echo   (Sheet default: MAV; sheet lain bisa diketik saat ditanya)
goto end
:nonode
echo.
echo   Node.js belum terpasang. Pasang versi LTS dari https://nodejs.org dulu.
:end
echo.
pause
