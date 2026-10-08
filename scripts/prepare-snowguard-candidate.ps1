param(
  [Parameter(Mandatory=$true)][string]$Source,
  [ValidatePattern('^v[0-9]+$')][string]$Version = 'v03',
  [ValidatePattern('^v[0-9]+$')][string]$SourceVersion = 'v02'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot = Join-Path $PSScriptRoot '../public/assets/beasts/snowguard'
$sourceRoot = Join-Path $PSScriptRoot '../art/beasts/snowguard'
New-Item -ItemType Directory -Force -Path $sourceRoot | Out-Null
Copy-Item -LiteralPath $Source -Destination (Join-Path $sourceRoot "snowguard_concept_$SourceVersion.png")
$image = [System.Drawing.Bitmap]::new($Source)
try {
  $transparent = 0
  foreach ($point in @(@(0,0), @(($image.Width-1),0), @(0,($image.Height-1)), @(($image.Width-1),($image.Height-1)))) {
    if ($image.GetPixel($point[0], $point[1]).A -eq 0) { $transparent++ }
  }
  if ($transparent -ne 4) { throw 'Candidate must have transparent corners.' }
  $base = [System.Drawing.Bitmap]::new(512,512,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($base)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($image, 0, 0, 512, 512)
    $base.Save((Join-Path $assetRoot "base_candidate_$Version.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $graphics.Dispose() }
  # Technical portrait export from the same artwork; no independent redesign.
  $icon = [System.Drawing.Bitmap]::new(256,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($icon)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(255,22,48,71))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $crop = [System.Drawing.RectangleF]::new(130,20,260,260)
    $graphics.DrawImage($base,[System.Drawing.RectangleF]::new(0,0,256,256),$crop,[System.Drawing.GraphicsUnit]::Pixel)
    $icon.Save((Join-Path $assetRoot "icon_candidate_$Version.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $graphics.Dispose(); $icon.Dispose(); $base.Dispose() }
  Write-Output ('Source: {0}x{1}; transparent corners: {2}/4; base: 512x512 RGBA; icon: 256x256' -f $image.Width,$image.Height,$transparent)
} finally { $image.Dispose() }
