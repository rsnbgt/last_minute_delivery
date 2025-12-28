$ErrorActionPreference = "Stop"

Write-Host "Stopping MySQL80 Service..."
Stop-Service -Name "MySQL80" -Force

Write-Host "Starting MySQL in skip-grant-tables mode..."
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$proc = Start-Process -FilePath $mysqlPath -ArgumentList "--console", "--skip-grant-tables", "--shared-memory" -PassThru -NoNewWindow
Start-Sleep -Seconds 10

Write-Host "Resetting password..."
$cmd = "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'password123';"
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "$cmd"

Write-Host "Stopping temporary MySQL process..."
Stop-Process -Id $proc.Id -Force
Start-Sleep -Seconds 5

Write-Host "Restarting MySQL80 Service..."
Start-Service -Name "MySQL80"

Write-Host "Password reset complete."
