$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\USER\Downloads\Mishutec\screenshots\phase5"

Remove-Item "$outDir\test.png" -ErrorAction SilentlyContinue

$views = @(
    @{ Name = "01-fase5-clientes-desktop.png"; Url = "http://localhost:3000/clientes"; Width = 1440; Height = 900 },
    @{ Name = "02-fase5-clientes-tablet.png"; Url = "http://localhost:3000/clientes"; Width = 768; Height = 1024 },
    @{ Name = "03-fase5-clientes-mobile.png"; Url = "http://localhost:3000/clientes"; Width = 390; Height = 844 },
    @{ Name = "04-fase5-proveedores-desktop.png"; Url = "http://localhost:3000/proveedores"; Width = 1440; Height = 900 },
    @{ Name = "05-fase5-proveedores-tablet.png"; Url = "http://localhost:3000/proveedores"; Width = 768; Height = 1024 },
    @{ Name = "06-fase5-proveedores-mobile.png"; Url = "http://localhost:3000/proveedores"; Width = 390; Height = 844 },
    @{ Name = "07-fase5-empleados-desktop.png"; Url = "http://localhost:3000/empleados"; Width = 1440; Height = 900 },
    @{ Name = "08-fase5-empleados-tablet.png"; Url = "http://localhost:3000/empleados"; Width = 768; Height = 1024 },
    @{ Name = "09-fase5-empleados-mobile.png"; Url = "http://localhost:3000/empleados"; Width = 390; Height = 844 }
)

foreach ($v in $views) {
    $outFile = "$outDir\$($v.Name)"
    Write-Host "Capturando $($v.Name)..."
    Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=$($v.Width),$($v.Height)", "--screenshot=$outFile", $v.Url -Wait
}

Write-Host "Todas las capturas completadas."
Get-ChildItem -Path $outDir | Select-Object Name, Length
