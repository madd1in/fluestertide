$ErrorActionPreference = 'Stop'
$nodePath = 'C:\Program Files\nodejs\node.exe'
$gameRoot = $PSScriptRoot

function Test-GameServer {
    try {
        $health = Invoke-RestMethod -Uri 'http://127.0.0.1:4187/__health' -TimeoutSec 2
        return $health.app -eq 'fluestertide'
    } catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath $nodePath)) {
    Write-Host 'Node.js fehlt. Bitte Node.js installieren oder README.md lesen.'
    exit 1
}

if (-not (Test-GameServer)) {
    $serverPath = Join-Path $gameRoot 'serve.cjs'
    Start-Process -FilePath $nodePath -ArgumentList "`"$serverPath`"" -WorkingDirectory $gameRoot -WindowStyle Hidden
    $startupDeadline = [DateTime]::UtcNow.AddSeconds(30)
    while ([DateTime]::UtcNow -lt $startupDeadline) {
        if (Test-GameServer) { break }
        Start-Sleep -Milliseconds 500
    }
}

if (-not (Test-GameServer)) {
    Write-Host 'Das Spiel konnte nicht starten. Port 4187 ist möglicherweise belegt. Details: README.md'
    exit 1
}

Start-Process 'http://127.0.0.1:4187'
