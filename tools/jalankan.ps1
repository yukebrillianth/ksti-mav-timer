# Dipanggil MULAI.bat: menjaga laptop & layar tetap menyala selama server jalan, lalu menjalankan server.
# Tidak mengubah setelan Power Windows; efeknya hilang sendiri saat jendela ditutup.
try {
  Add-Type -Namespace Win -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
  [void][Win.Power]::SetThreadExecutionState([uint32]2147483651)  # ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
  Write-Host "  Laptop dan layar dijaga tetap menyala selama jendela ini terbuka."
} catch {
  Write-Host "  (Gagal mencegah sleep otomatis. Atur Power & sleep ke 'Never' secara manual.)"
}
Set-Location (Split-Path $PSScriptRoot -Parent)
& node server.js --buka
exit $LASTEXITCODE
