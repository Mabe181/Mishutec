$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\phase7a"
$tempProfile = "$env:TEMP\edge_screenshot_profile_7a"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$views = @(
    @{ Name = "01-fase7a-devoluciones-desktop.png"; Url = "http://localhost:3000/devoluciones"; Width = 1440; Height = 950; Sleep = 800 },
    @{ Name = "02-fase7a-devoluciones-tablet.png"; Url = "http://localhost:3000/devoluciones"; Width = 768; Height = 1024; Sleep = 800 },
    @{ Name = "03-fase7a-devoluciones-mobile.png"; Url = "http://localhost:3000/devoluciones"; Width = 390; Height = 844; Sleep = 800 },
    @{ Name = "04-fase7a-devoluciones-modal-desktop.png"; Url = "http://localhost:3000/devoluciones?id=1"; Width = 1440; Height = 950; Sleep = 1500 },
    @{ Name = "05-fase7a-devoluciones-modal-mobile.png"; Url = "http://localhost:3000/devoluciones?id=1"; Width = 390; Height = 844; Sleep = 1500 }
)

foreach ($v in $views) {
    $outFile = "$outDir\$($v.Name)"
    Write-Host "Capturando $($v.Name)..."
    & $edge --headless --disable-gpu --user-data-dir=$tempProfile --window-size="$($v.Width),$($v.Height)" --screenshot=$outFile $v.Url
    Start-Sleep -Milliseconds $v.Sleep
}

Write-Host "Todas las capturas de la Fase 7A se completaron."
Copy-Item -Path "$outDir\*" -Destination "C:\Users\USER\.gemini\antigravity\brain\74973783-98f5-4036-b8a0-a9eb9bf55896\" -Force
Get-ChildItem -Path $outDir | Select-Object Name, Length, LastWriteTime
