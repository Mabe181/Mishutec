$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\phase6b"
$tempProfile = "$env:TEMP\edge_screenshot_profile"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$views = @(
    @{ Name = "01-fase6b-ventas-historial-desktop.png"; Url = "http://localhost:3000/ventas"; Width = 1440; Height = 950 },
    @{ Name = "02-fase6b-pos-terminal-desktop.png"; Url = "http://localhost:3000/ventas?tab=pos"; Width = 1440; Height = 950 },
    @{ Name = "03-fase6b-pos-terminal-tablet.png"; Url = "http://localhost:3000/ventas?tab=pos"; Width = 768; Height = 1024 },
    @{ Name = "04-fase6b-pos-terminal-mobile.png"; Url = "http://localhost:3000/ventas?tab=pos"; Width = 390; Height = 844 },
    @{ Name = "05-fase6b-inventario-kardex-desktop.png"; Url = "http://localhost:3000/inventario"; Width = 1440; Height = 950 },
    @{ Name = "06-fase6b-dashboard-kpis-desktop.png"; Url = "http://localhost:3000/dashboard"; Width = 1440; Height = 950 }
)

foreach ($v in $views) {
    $outFile = "$outDir\$($v.Name)"
    Write-Host "Capturando $($v.Name)..."
    & $edge --headless --disable-gpu --user-data-dir=$tempProfile --window-size="$($v.Width),$($v.Height)" --screenshot=$outFile $v.Url
    Start-Sleep -Milliseconds 400
}

Write-Host "Todas las capturas de la Fase 6B se completaron."
Copy-Item -Path "$outDir\*" -Destination "C:\Users\USER\.gemini\antigravity\brain\74973783-98f5-4036-b8a0-a9eb9bf55896\" -Force
Get-ChildItem -Path $outDir | Select-Object Name, Length, LastWriteTime
