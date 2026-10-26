$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\phase8"
$tempProfile = "$env:TEMP\edge_screenshot_profile_8"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$views = @(
    @{ Name = "01-fase8-reportes-desktop.png"; Url = "http://localhost:3000/reportes"; Width = 1440; Height = 950; Sleep = 1200 },
    @{ Name = "02-fase8-reportes-tablet.png"; Url = "http://localhost:3000/reportes"; Width = 768; Height = 1024; Sleep = 1200 },
    @{ Name = "03-fase8-reportes-mobile-390.png"; Url = "http://localhost:3000/reportes"; Width = 390; Height = 844; Sleep = 1200 },
    @{ Name = "04-fase8-reportes-mobile-320.png"; Url = "http://localhost:3000/reportes"; Width = 320; Height = 568; Sleep = 1200 },
    @{ Name = "05-fase8-reportes-kpis-zoom.png"; Url = "http://localhost:3000/reportes"; Width = 1440; Height = 720; Sleep = 1000 }
)

foreach ($v in $views) {
    $outFile = "$outDir\$($v.Name)"
    Write-Host "Capturando $($v.Name)..."
    & $edge --headless --disable-gpu --user-data-dir=$tempProfile --window-size="$($v.Width),$($v.Height)" --screenshot=$outFile $v.Url
    Start-Sleep -Milliseconds $v.Sleep
}

Write-Host "Todas las capturas de la Fase 8 se completaron."
$artDir = "C:\Users\USER\.gemini\antigravity\brain\74973783-98f5-4036-b8a0-a9eb9bf55896\"
Copy-Item -Path "$outDir\*" -Destination $artDir -Force
Get-ChildItem -Path $outDir | Select-Object Name, Length, LastWriteTime
