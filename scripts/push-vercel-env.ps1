$ErrorActionPreference = "Stop"

$nodeDir = Join-Path $env:LOCALAPPDATA "Programs\nodejs"
$env:Path = "$nodeDir;$env:Path"
$npx = Join-Path $nodeDir "npx.cmd"
$projectRoot = "D:\Codex\sofi-knots"
$envFile = Join-Path $projectRoot ".env.local"

$pairs = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    $pairs[$matches[1]] = $matches[2]
  }
}

$pairs["NEXT_PUBLIC_SITE_URL"] = "https://sofi-knots.vercel.app"

$keys = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL"
)

foreach ($key in $keys) {
  $tmp = [System.IO.Path]::GetTempFileName()
  try {
    [System.IO.File]::WriteAllText($tmp, $pairs[$key])
    cmd.exe /c "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && npx vercel env add $key production < `"$tmp`""
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}
