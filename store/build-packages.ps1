param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$version = (Get-Content -LiteralPath (Join-Path $RepositoryRoot 'manifest.json') -Raw | ConvertFrom-Json).version
$distDir = Join-Path $RepositoryRoot 'dist'
$storeDir = Join-Path $RepositoryRoot 'store'
$runtimeFiles = @('manifest.json', 'background.js', 'content.js')
$runtimeDirs = @('icons')

New-Item -ItemType Directory -Force -Path $distDir | Out-Null

function Copy-Runtime([string]$DestinationRoot) {
  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
  foreach ($file in $runtimeFiles) {
    Copy-Item -LiteralPath (Join-Path $RepositoryRoot $file) -Destination $DestinationRoot
  }
  foreach ($directory in $runtimeDirs) {
    Copy-Item -LiteralPath (Join-Path $RepositoryRoot $directory) -Destination $DestinationRoot -Recurse
  }
}

function New-ZipFromDirectory([string]$SourceDirectory, [string]$DestinationPath) {
  if (Test-Path -LiteralPath $DestinationPath) {
    Remove-Item -LiteralPath $DestinationPath
  }
  Compress-Archive -LiteralPath (Get-ChildItem -LiteralPath $SourceDirectory -Force | Select-Object -ExpandProperty FullName) -DestinationPath $DestinationPath -CompressionLevel Optimal
}

$tempBase = Join-Path ([System.IO.Path]::GetTempPath()) ('NovelFlowPackages-' + [Guid]::NewGuid().ToString('N'))
$installStage = Join-Path $tempBase 'NovelFlow_1.0.6_Chrome'
$storeStage = Join-Path $tempBase 'NovelFlow_1.0.6_ChromeWebStore'
$installRoot = Join-Path $installStage 'novel-flow-extension'

try {
  New-Item -ItemType Directory -Force -Path $tempBase | Out-Null
  Copy-Runtime $installRoot
  Copy-Runtime $storeStage

  $installZip = Join-Path $distDir "NovelFlow_$version`_Chrome.zip"
  $storeZip = Join-Path $storeDir "NovelFlow_$version`_ChromeWebStore.zip"
  New-ZipFromDirectory $installStage $installZip
  New-ZipFromDirectory $storeStage $storeZip

  $storeArchive = [System.IO.Compression.ZipFile]::OpenRead($storeZip)
  try {
    $entries = @($storeArchive.Entries | ForEach-Object FullName)
  } finally {
    $storeArchive.Dispose()
  }
  if ($entries -notcontains 'manifest.json') {
    throw '商店包根目录缺少 manifest.json'
  }
  if ($entries -match '/manifest\.json$') {
    throw "manifest.json 不在 ZIP 根目录：$($entries -join ', ')"
  }
  if ($entries -match '^(tests|scripts|store|docs)/') {
    throw "商店包包含不应发布的内容：$($entries -join ', ')"
  }

  $installArchive = [System.IO.Compression.ZipFile]::OpenRead($installZip)
  try {
    $installEntries = @($installArchive.Entries | ForEach-Object FullName)
  } finally {
    $installArchive.Dispose()
  }
  if ($installEntries -notcontains 'novel-flow-extension/manifest.json') {
    throw '本地安装包根目录异常'
  }
  if ($installEntries -match '^novel-flow-extension/(tests|scripts|store|docs)/') {
    throw '本地安装包包含不应发布的目录'
  }

  $hashes = @($installZip, $storeZip) | ForEach-Object {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_).Hash
    '{0}  {1}' -f $hash, (Split-Path -Leaf $_)
  }
  $hashLine = "SHA-256 ($version)"
  $hashFile = Join-Path $distDir 'SHA256SUMS.txt'
  @($hashLine) + $hashes | Set-Content -LiteralPath $hashFile -Encoding utf8

  [pscustomobject]@{
    Version = $version
    InstallZip = $installZip
    StoreZip = $storeZip
    StoreEntries = $entries.Count
    InstallEntries = $installEntries.Count
    Hashes = $hashFile
  } | Format-List
} finally {
  if (Test-Path -LiteralPath $tempBase) {
    $resolvedTempBase = (Resolve-Path -LiteralPath $tempBase).Path
    $resolvedSystemTemp = (Resolve-Path -LiteralPath ([System.IO.Path]::GetTempPath())).Path
    if (-not $resolvedTempBase.StartsWith($resolvedSystemTemp, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "拒绝清理非临时目录：$resolvedTempBase"
    }
    Remove-Item -LiteralPath $resolvedTempBase -Recurse -Force
  }
}
