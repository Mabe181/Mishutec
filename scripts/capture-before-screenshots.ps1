$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\responsive_audit\before"

$pages = @("dashboard", "productos", "inventario", "clientes", "proveedores", "empleados")

foreach ($p in $pages) {
    $url = "http://localhost:3000/$p"
    Write-Host "Capturando BEFORE para $p..."

    # Mobile 390x844
    Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=390,844", "--screenshot=$outDir\$p-mobile-390.png", $url -Wait

    # Small Mobile 320x568
    Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=320,568", "--screenshot=$outDir\$p-mobile-320.png", $url -Wait

    # Tablet 768x1024
    Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=768,1024", "--screenshot=$outDir\$p-tablet-768.png", $url -Wait
}

Write-Host "Capturas BEFORE completadas con éxito."
Get-ChildItem -Path $outDir | Select-Object Name, Length
