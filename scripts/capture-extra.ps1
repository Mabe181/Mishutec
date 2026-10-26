$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\phase6b"
$tempProfile = "$env:TEMP\edge_screenshot_profile"

Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--user-data-dir=$tempProfile", "--window-size=1440,950", "--screenshot=$outDir\02-fase6b-pos-terminal-desktop.png", "http://localhost:3000/ventas?tab=pos" -Wait
Start-Sleep -Milliseconds 800

Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--user-data-dir=$tempProfile", "--window-size=390,844", "--screenshot=$outDir\04-fase6b-pos-terminal-mobile.png", "http://localhost:3000/ventas?tab=pos" -Wait
Start-Sleep -Milliseconds 800

Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--user-data-dir=$tempProfile", "--window-size=1440,950", "--screenshot=$outDir\06-fase6b-dashboard-kpis-desktop.png", "http://localhost:3000/dashboard" -Wait
Start-Sleep -Milliseconds 800

Copy-Item -Path "$outDir\*" -Destination "C:\Users\USER\.gemini\antigravity\brain\74973783-98f5-4036-b8a0-a9eb9bf55896\" -Force
Get-ChildItem -Path $outDir | Select-Object Name, Length
