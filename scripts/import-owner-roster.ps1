param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Collections,System.Runtime,System.Private.Windows.GdiPlus,System.Private.Windows.Core -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class RosterExport {
  public static List<Rectangle> Regions(Bitmap image, int row) {
    int y0 = row * image.Height / 3, y1 = (row + 1) * image.Height / 3;
    var spans = new List<Rectangle>(); int start = -1, last = -1;
    for (int x = 0; x <= image.Width + 4; x++) {
      int count = 0;
      if (x < image.Width) for (int y = y0; y < y1; y++) if (image.GetPixel(x,y).A >= 32) count++;
      if (count >= 4) { if (start < 0) start = x; last = x; }
      else if (start >= 0 && x - last > 3) {
        int top = y1, bottom = y0;
        for (int bx = start; bx <= last; bx++) for (int y = y0; y < y1; y++)
          if (image.GetPixel(bx,y).A >= 32) { top = Math.Min(top,y); bottom = Math.Max(bottom,y); }
        spans.Add(Rectangle.FromLTRB(Math.Max(0,start-2),Math.Max(y0,top-2),Math.Min(image.Width,last+3),Math.Min(y1,bottom+3)));
        start = -1;
      }
    }
    if (spans.Count != 9) throw new Exception("Row " + row + ": expected 9 regions, got " + spans.Count);
    return spans;
  }
  public static void Save(Bitmap source, Rectangle crop, string path, bool icon, Color color) {
    int size = icon ? 256 : 512;
    using(var output = new Bitmap(size,size,PixelFormat.Format32bppArgb))
    using(var g = Graphics.FromImage(output)) {
      g.Clear(Color.Transparent); g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      if (icon) {
        using(var shape = new GraphicsPath()) {
          shape.AddEllipse(8,8,240,240); g.SetClip(shape);
          using(var brush = new SolidBrush(color)) g.FillEllipse(brush,8,8,240,240);
          crop.Height = Math.Max(1,(int)(crop.Height * 0.65));
          float scale = Math.Min(232f/crop.Width,232f/crop.Height);
          float w = crop.Width*scale, h = crop.Height*scale;
          g.DrawImage(source,new RectangleF((256-w)/2,18,w,h),crop,GraphicsUnit.Pixel);
          g.ResetClip();
          using(var pen = new Pen(Color.Black,10)) g.DrawEllipse(pen,8,8,240,240);
        }
      } else {
        float scale = Math.Min(480f/crop.Width,480f/crop.Height);
        float w = crop.Width*scale, h = crop.Height*scale;
        g.DrawImage(source,new RectangleF((512-w)/2,496-h,w,h),crop,GraphicsUnit.Pixel);
      }
      output.Save(path,ImageFormat.Png);
    }
  }
}
'@
$repoRoot = Split-Path $PSScriptRoot -Parent
$library = Join-Path $repoRoot 'public/assets/characters'
$sourceRoot = Join-Path $repoRoot 'art/owner-supplied/2026-10-08'
New-Item -ItemType Directory -Force -Path $sourceRoot | Out-Null
Copy-Item -LiteralPath $Source -Destination (Join-Path $sourceRoot 'roster27-cutout-v01.png')
$slugs = @(
 'duck-guardian','bear-hammer','rabbit-archer','fox-archer','raccoon-swordsman','badger-mage','dog-paladin','frog-mage','pig-viking',
 'penguin-knight','wolf-swordsman','mouse-mage','turtle-spearman','sheep-cleric','owl-scholar','shark-spearman','polar-bear-axeman','crow-assassin',
 'deer-archer','hedgehog-bomber','panda-warrior','chicken-cleric','cat-ninja','penguin-mage','elephant-hammer','crocodile-pirate','duck-engineer'
)
$sourceImage = [System.Drawing.Bitmap]::new($Source)
$entries = @()
try {
 if ($sourceImage.GetPixel(0,0).A -ne 0) { throw 'Source requires transparency.' }
 for ($row=0; $row -lt 3; $row++) {
  $regions = [RosterExport]::Regions($sourceImage,$row)
  for ($column=0; $column -lt 9; $column++) {
   $slug = $slugs[$row*9+$column]
   $directory = Join-Path $library $slug
   New-Item -ItemType Directory -Force -Path $directory | Out-Null
   $color = [System.Drawing.Color]::FromArgb(79,94,133)
   [RosterExport]::Save($sourceImage,$regions[$column],(Join-Path $directory 'base_v01.png'),$false,$color)
   [RosterExport]::Save($sourceImage,$regions[$column],(Join-Path $directory 'icon_v01.png'),$true,$color)
   $entries += [ordered]@{slug=$slug; row=$row+1; column=$column+1; base="/assets/characters/$slug/base_v01.png"; icon="/assets/characters/$slug/icon_v01.png"; status='EXPORTED_LIVE_QA_OPEN'}
   Write-Output ($slug + ': ' + $regions[$column])
  }
 }
} finally { $sourceImage.Dispose() }
$entries | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $library 'manifest.json') -Encoding utf8

$sheet = [System.Drawing.Bitmap]::new(1080,600)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$font = [System.Drawing.Font]::new('Arial',8)
try {
 $g.Clear([System.Drawing.Color]::FromArgb(11,18,40))
 $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 for ($i=0; $i -lt 27; $i++) {
  $x = ($i%9)*120; $y = [Math]::Floor($i/9)*200
  $b = [System.Drawing.Bitmap]::new((Join-Path $library ($slugs[$i]+'/base_v01.png')))
  $ic = [System.Drawing.Bitmap]::new((Join-Path $library ($slugs[$i]+'/icon_v01.png')))
  try {
   if ($b.GetPixel(0,0).A -ne 0 -or $ic.GetPixel(0,0).A -ne 0) { throw 'Export lost alpha.' }
   $g.DrawImage($ic,[int]($x+40),[int]($y+4),40,40)
   $g.DrawImage($b,[int]$x,[int]($y+45),120,120)
   $g.DrawString($slugs[$i],$font,[System.Drawing.Brushes]::White,[single]($x+5),[single]($y+178))
  } finally { $b.Dispose(); $ic.Dispose() }
 }
 $sheet.Save((Join-Path $sourceRoot 'roster27-runtime-v01.png'),[System.Drawing.Imaging.ImageFormat]::Png)
} finally { $g.Dispose(); $font.Dispose(); $sheet.Dispose() }
