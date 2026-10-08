param(
  [Parameter(Mandatory=$true)][string]$CutoutSheet,
  [Parameter(Mandatory=$true)][string]$IconSheet
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Collections,System.Runtime,System.Private.Windows.GdiPlus,System.Private.Windows.Core -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class OwnerArtExport {
  public static List<Rectangle> Regions(Bitmap image) {
    var spans = new List<Rectangle>();
    int start = -1, last = -1;
    for (int x = 0; x < image.Width; x++) {
      int count = 0;
      for (int y = 0; y < image.Height; y++) if (image.GetPixel(x,y).A >= 32) count++;
      if (count >= 4) {
        if (start < 0) start = x;
        last = x;
      } else if (start >= 0 && x - last > 12) {
        spans.Add(Bounds(image,start,last + 1)); start = -1;
      }
    }
    if (start >= 0) spans.Add(Bounds(image,start,last + 1));
    if (spans.Count != 5) throw new Exception("Expected 5 separated characters, got " + spans.Count);
    return spans;
  }
  static Rectangle Bounds(Bitmap image, int left, int right) {
    int top = image.Height, bottom = -1;
    for (int x = left; x < right; x++) for (int y = 0; y < image.Height; y++) {
      if (image.GetPixel(x,y).A >= 8) { top = Math.Min(top,y); bottom = Math.Max(bottom,y); }
    }
    left = Math.Max(0,left - 3); right = Math.Min(image.Width,right + 3);
    top = Math.Max(0,top - 3); bottom = Math.Min(image.Height - 1,bottom + 3);
    return Rectangle.FromLTRB(left,top,right,bottom + 1);
  }
  public static void Export(Bitmap source, Rectangle crop, string path, int size, bool ground) {
    using (var output = new Bitmap(size,size,PixelFormat.Format32bppArgb))
    using (var g = Graphics.FromImage(output)) {
      g.Clear(Color.Transparent);
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      float pad = ground ? 16 : 6;
      float scale = Math.Min((size - 2 * pad) / crop.Width,(size - 2 * pad) / crop.Height);
      float width = crop.Width * scale, height = crop.Height * scale;
      float y = ground ? size - pad - height : (size - height) / 2;
      g.DrawImage(source,new RectangleF((size - width)/2,y,width,height),crop,GraphicsUnit.Pixel);
      output.Save(path,ImageFormat.Png);
    }
  }
}
'@
$repoRoot = Split-Path $PSScriptRoot -Parent
$sourceRoot = Join-Path $repoRoot 'art/owner-supplied/2026-10-08'
New-Item -ItemType Directory -Path $sourceRoot -Force | Out-Null
Copy-Item -LiteralPath $CutoutSheet -Destination (Join-Path $sourceRoot 'characters-cutout-v01.png')
Copy-Item -LiteralPath $IconSheet -Destination (Join-Path $sourceRoot 'portraits-source-v01.png')
$cutouts = [System.Drawing.Bitmap]::new($CutoutSheet)
$icons = [System.Drawing.Bitmap]::new($IconSheet)
try {
  if ($cutouts.GetPixel(0,0).A -ne 0 -or $icons.GetPixel(0,0).A -ne 0) { throw 'Sheets must have alpha backgrounds.' }
  $bodyRegions = [OwnerArtExport]::Regions($cutouts)
  $iconRegions = [OwnerArtExport]::Regions($icons)
  $slugs = @('snowguard','ironclad','windstrider','swiftwing','shadowclaw')
  for ($i = 0; $i -lt 5; $i++) {
    $directory = Join-Path $repoRoot ('public/assets/beasts/' + $slugs[$i])
    [OwnerArtExport]::Export($cutouts,$bodyRegions[$i],(Join-Path $directory 'base_owner_v01.png'),512,$true)
    [OwnerArtExport]::Export($icons,$iconRegions[$i],(Join-Path $directory 'icon_owner_v01.png'),256,$false)
    Write-Output ($slugs[$i] + ': body=' + $bodyRegions[$i] + '; icon=' + $iconRegions[$i])
  }
} finally { $cutouts.Dispose(); $icons.Dispose() }

$sheet = [System.Drawing.Bitmap]::new(800,260)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$font = [System.Drawing.Font]::new('Arial',11)
try {
  $g.Clear([System.Drawing.Color]::FromArgb(11,18,40))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  for ($i = 0; $i -lt 5; $i++) {
    $directory = Join-Path $repoRoot ('public/assets/beasts/' + $slugs[$i])
    $body = [System.Drawing.Bitmap]::new((Join-Path $directory 'base_owner_v01.png'))
    $portrait = [System.Drawing.Bitmap]::new((Join-Path $directory 'icon_owner_v01.png'))
    try {
      if ($body.GetPixel(0,0).A -ne 0 -or $portrait.GetPixel(0,0).A -ne 0) { throw 'Export lost transparent padding.' }
      $g.DrawImage($portrait,($i*160+48),12,64,64)
      $g.DrawImage($body,($i*160+16),82,128,128)
      $g.DrawString($slugs[$i],$font,[System.Drawing.Brushes]::White,($i*160+30),228)
    } finally { $body.Dispose(); $portrait.Dispose() }
  }
  $sheet.Save((Join-Path $sourceRoot 'runtime-lineup-v01.png'),[System.Drawing.Imaging.ImageFormat]::Png)
} finally { $g.Dispose(); $sheet.Dispose(); $font.Dispose() }
