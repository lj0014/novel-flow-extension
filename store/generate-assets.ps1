param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $RepositoryRoot 'icons'
$storeDir = Join-Path $RepositoryRoot 'store'
$screenshotsDir = Join-Path $storeDir 'screenshots'
$sourceIconPath = Join-Path $iconsDir '128.png'
$rawIconPath = Join-Path $storeDir 'store-icon-source-128.png'
$sourceShotPath = Join-Path $RepositoryRoot 'tests\reader-fixed.png'
$storeIconPath = Join-Path $storeDir 'store-icon-128.png'
$screenshotPath = Join-Path $screenshotsDir 'reader-1280x800.png'
$promoPath = Join-Path $storeDir 'promo-440x280.png'

New-Item -ItemType Directory -Force -Path $screenshotsDir | Out-Null

function Save-Png([System.Drawing.Bitmap]$Bitmap, [string]$Path) {
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
}

function New-PaddedIcon([string]$SourcePath, [string]$DestinationPath) {
  $source = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $target = [System.Drawing.Bitmap]::new(
      128,
      128,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($source, 16, 16, 96, 96)
    } finally {
      $graphics.Dispose()
    }
    Save-Png $target $DestinationPath
  } finally {
    $source.Dispose()
  }
}

function New-Screenshot([string]$SourcePath, [string]$DestinationPath) {
  $source = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $target = [System.Drawing.Bitmap]::new(
      1280,
      800,
      [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $sourceRectangle = [System.Drawing.RectangleF]::new(0, 12, 1400, 876)
      $destinationRectangle = [System.Drawing.RectangleF]::new(0, 0, 1280, 800)
      $graphics.DrawImage(
        $source,
        $destinationRectangle,
        $sourceRectangle,
        [System.Drawing.GraphicsUnit]::Pixel
      )
    } finally {
      $graphics.Dispose()
    }
    Save-Png $target $DestinationPath
  } finally {
    $source.Dispose()
  }
}

function New-Promo([string]$IconPath, [string]$ScreenshotPath, [string]$DestinationPath) {
  $bitmap = [System.Drawing.Bitmap]::new(
    440,
    280,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $icon = [System.Drawing.Image]::FromFile($IconPath)
  $preview = [System.Drawing.Image]::FromFile($ScreenshotPath)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::FromArgb(222, 236, 217))

    $decorBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(80, 181, 205, 178))
    $decorBrush2 = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(110, 247, 251, 245))
    try {
      $graphics.FillEllipse($decorBrush2, 278, -88, 280, 280)
      $graphics.FillEllipse($decorBrush, -80, 205, 240, 170)
    } finally {
      $decorBrush.Dispose()
      $decorBrush2.Dispose()
    }

    $graphics.DrawImage($icon, 26, 38, 78, 78)

    $titleFont = [System.Drawing.Font]::new(
      'Microsoft YaHei UI',
      25,
      [System.Drawing.FontStyle]::Bold,
      [System.Drawing.GraphicsUnit]::Pixel
    )
    $subtitleFont = [System.Drawing.Font]::new(
      'Microsoft YaHei UI',
      14,
      [System.Drawing.FontStyle]::Regular,
      [System.Drawing.GraphicsUnit]::Pixel
    )
    $tagFont = [System.Drawing.Font]::new(
      'Microsoft YaHei UI',
      13,
      [System.Drawing.FontStyle]::Bold,
      [System.Drawing.GraphicsUnit]::Pixel
    )
    $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45, 68, 53))
    $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(77, 102, 83))
    $tagBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(247, 251, 245))
    try {
      $graphics.DrawString('阅流', $titleFont, $ink, 24, 126)
      $graphics.DrawString('沉浸阅读', $subtitleFont, $muted, 92, 136)
      $graphics.FillRectangle($tagBrush, 24, 174, 104, 30)
      $graphics.DrawString('护眼 · 连续', $tagFont, $ink, 36, 181)
    } finally {
      $ink.Dispose()
      $muted.Dispose()
      $tagBrush.Dispose()
      $titleFont.Dispose()
      $subtitleFont.Dispose()
      $tagFont.Dispose()
    }

    $shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(28, 20, 35, 25))
    $borderPen = [System.Drawing.Pen]::new(
      [System.Drawing.Color]::FromArgb(181, 205, 178),
      2
    )
    try {
      $graphics.FillRectangle($shadow, 154, 60, 262, 174)
      $graphics.DrawImage($preview, 146, 50, 262, 164)
      $graphics.DrawRectangle($borderPen, 146, 50, 261, 163)
    } finally {
      $shadow.Dispose()
      $borderPen.Dispose()
    }
  } finally {
    $icon.Dispose()
    $preview.Dispose()
    $graphics.Dispose()
  }
  Save-Png $bitmap $DestinationPath
}

if (-not (Test-Path -LiteralPath $rawIconPath)) {
  Copy-Item -LiteralPath $sourceIconPath -Destination $rawIconPath
}
New-PaddedIcon $rawIconPath $sourceIconPath
Copy-Item -LiteralPath $sourceIconPath -Destination $storeIconPath -Force
New-Screenshot $sourceShotPath $screenshotPath
New-Promo $storeIconPath $screenshotPath $promoPath

Write-Output "Generated:"
Write-Output $sourceIconPath
Write-Output $storeIconPath
Write-Output $screenshotPath
Write-Output $promoPath
