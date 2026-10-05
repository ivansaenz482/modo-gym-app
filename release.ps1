# release.ps1
# Publica MODO GYM en los DOS canales a la vez:
#   1) Web (landing + PWA)  -> git push  -> Vercel despliega solo
#   2) Play Store            -> EAS build (AAB) -> subir a Play Console
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File release.ps1
#   powershell -ExecutionPolicy Bypass -File release.ps1 -Message "feat: modo navideno"
#   powershell -ExecutionPolicy Bypass -File release.ps1 -Submit   (ademas sube el AAB a Play con eas submit)

param(
  [string]$Message = "chore: release $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
  [switch]$Submit
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== MODO GYM - RELEASE (web + Play Store) ===" -ForegroundColor Yellow
Write-Host ""

# ---- 1) Web: commit + push (Vercel auto-deploy) ----
Write-Host "[1/3] Subiendo cambios a GitHub (actualiza web en Vercel)..." -ForegroundColor Cyan
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "      Sin cambios nuevos para commitear. Push igual para asegurar." -ForegroundColor DarkGray
} else {
  git -c user.email="itenetas@unemi.edu.ec" -c user.name="Ivan Teneta" commit -m $Message | Out-Host
}
git push | Out-Host
Write-Host "      Web: https://modogym.vercel.app  ·  https://modogym-landing.vercel.app" -ForegroundColor Green

# ---- 2) Play Store: build del AAB ----
Write-Host ""
Write-Host "[2/3] Compilando AAB de produccion con EAS (versionCode se incrementa solo)..." -ForegroundColor Cyan
npx eas-cli build --platform android --profile production --non-interactive | Out-Host

# ---- 3) (Opcional) submit a Play ----
if ($Submit) {
  Write-Host ""
  Write-Host "[3/3] Subiendo AAB a Google Play (eas submit)..." -ForegroundColor Cyan
  npx eas-cli submit --platform android --profile production --non-interactive --latest | Out-Host
  Write-Host "      Enviado a Play. Revisa Play Console -> Produccion." -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "[3/3] Listo." -ForegroundColor Green
  Write-Host "      Descarga el .aab desde el link de EAS y subilo en:" -ForegroundColor White
  Write-Host "      Play Console -> Produccion -> Crear nueva version -> subir AAB." -ForegroundColor White
  Write-Host "      (O corre con -Submit para que se suba solo, requiere Service Account de Google Play.)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== FIN ===" -ForegroundColor Yellow
