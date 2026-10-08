param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Collections,System.Runtime,System.Private.Windows.GdiPlus,System.Private.Windows.Core -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class PortraitUpdate {
 public static List<Rectangle> Groups(Bitmap b, Rectangle area, bool rows, int expected) {
  var result=new List<Rectangle>(); int start=-1,last=-1;
  int length=rows?area.Height:area.Width, cross=rows?area.Width:area.Height;
  for(int i=0;i<length+9;i++) {
   int count=0;
   if(i<length) for(int j=0;j<cross;j++) {
    int x=area.X+(rows?j:i), y=area.Y+(rows?i:j);
    if(b.GetPixel(x,y).A>=32) count++;
   }
   if(count>=4) {if(start<0) start=i;last=i;}
   else if(start>=0 && i-last>(rows?8:1)) {
    int s=Math.Max(0,start-2), e=Math.Min(length,last+3);
    result.Add(rows?new Rectangle(area.X,area.Y+s,area.Width,e-s):new Rectangle(area.X+s,area.Y,e-s,area.Height)); start=-1;
   }
  }
  if(result.Count!=expected) throw new Exception("Expected "+expected+" groups, got "+result.Count);
  return result;
 }
 public static void Save(Bitmap source,Rectangle crop,string path) {
  using(var output=new Bitmap(256,256,PixelFormat.Format32bppArgb))
  using(var g=Graphics.FromImage(output)) {
   g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;
   float scale=Math.Min(244f/crop.Width,244f/crop.Height),w=crop.Width*scale,h=crop.Height*scale;
   g.DrawImage(source,new RectangleF((256-w)/2,(256-h)/2,w,h),crop,GraphicsUnit.Pixel);
   output.Save(path,ImageFormat.Png);
  }
 }
}
'@
$repoRoot = Split-Path $PSScriptRoot -Parent
$sourceRoot = Join-Path $repoRoot 'art/owner-supplied/2026-10-08'
Copy-Item -LiteralPath $Source -Destination (Join-Path $sourceRoot 'portraits27-colored-cutout-v02.png')
$rows = @(
 @('duck-guardian','bear-hammer','rabbit-archer','fox-archer','raccoon-swordsman','badger-mage','dog-paladin','frog-mage','pig-viking','axe-badge'),
 @('penguin-knight','wolf-swordsman','mouse-mage','turtle-spearman','sheep-cleric','owl-scholar','shark-spearman','polar-bear-alternate','polar-bear-axeman','crow-assassin'),
 @('deer-archer','hedgehog-bomber','panda-warrior','chicken-cleric','cat-ninja','penguin-mage','elephant-hammer','crocodile-pirate','duck-engineer')
)
$image = [System.Drawing.Bitmap]::new($Source)
try {
 if($image.GetPixel(0,0).A -ne 0) {throw 'Extracted source must have alpha.'}
 $rowRegions = [PortraitUpdate]::Groups($image,[System.Drawing.Rectangle]::new(0,0,$image.Width,$image.Height),$true,3)
 for($r=0;$r -lt 3;$r++) {
  if($r -eq 2) {
   # Several original bottom-row badges touch; alpha projection cannot separate them.
   $edges=@(18,212,416,618,819,1021,1223,1451,1747,1974)
   $cells=@()
   for($i=0;$i -lt 9;$i++) {
    $left=[int][Math]::Round($edges[$i]*$image.Width/1986)
    $right=[int][Math]::Round($edges[$i+1]*$image.Width/1986)
    $cells += [System.Drawing.Rectangle]::new($left,$rowRegions[$r].Y,($right-$left),$rowRegions[$r].Height)
   }
  } else {
   $cells = [PortraitUpdate]::Groups($image,$rowRegions[$r],$false,$rows[$r].Count)
  }
  for($c=0;$c -lt $rows[$r].Count;$c++) {
   $slug=$rows[$r][$c]
   if($slug -eq 'axe-badge') {
    $directory=Join-Path $repoRoot 'public/assets/ui'; $file='axe_owner_v02.png'
   } elseif($slug -eq 'polar-bear-alternate') {
    $directory=Join-Path $repoRoot 'public/assets/characters/polar-bear-axeman'; $file='icon_alternate_v02.png'
   } else {
    $directory=Join-Path $repoRoot ('public/assets/characters/'+$slug); $file='icon_v02.png'
   }
   New-Item -ItemType Directory -Force -Path $directory | Out-Null
   [PortraitUpdate]::Save($image,$cells[$c],(Join-Path $directory $file))
   Write-Output ($slug+': '+$cells[$c])
  }
 }
} finally {$image.Dispose()}
$manifestPath=Join-Path $repoRoot 'public/assets/characters/manifest.json'
$entries=Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
foreach($entry in $entries) {$entry.icon='/assets/characters/'+$entry.slug+'/icon_v02.png'}
$entries | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding utf8
