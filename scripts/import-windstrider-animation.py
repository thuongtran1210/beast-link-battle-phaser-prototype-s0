"""Preserve owner sheets and measure runtime windows; never rewrite bitmap pixels."""
from pathlib import Path
from PIL import Image
import json, shutil

root = Path(__file__).resolve().parents[1]
source = Path('C:/Users/thuon/AppData/Local/Temp')
files = {
 'idle':'codex-clipboard-b581fa95-2d3f-46b2-a93c-32c110d05dfe.png',
 'walk':'codex-clipboard-028f0cc9-0351-4e34-af2a-6735d8e87549.png',
 'attack':'codex-clipboard-5b689d0e-04a9-452c-917e-96c64e21131a.png',
 'skill':'codex-clipboard-bb53cea7-2ca1-40f9-a46f-bf3c0bdb6610.png',
 'hit':'codex-clipboard-638b57cf-5736-457e-a487-af8283988194.png',
 'ko':'codex-clipboard-c7701cda-d8fd-4f75-b636-df988d83c9a7.png',
}
destination = root/'public/assets/characters/rabbit-archer/animation_v01'
destination.mkdir(parents=True,exist_ok=True)
frames = {}
report = {}
for clip, filename in files.items():
 image = Image.open(source/filename)
 if image.mode != 'RGBA' or image.getchannel('A').getextrema()[0] != 0:
  raise ValueError(f'{clip}: genuine RGBA transparency required')
 width,height=image.size
 cells=[]
 for index in range(8):
  col,row=index%4,index//4
  x,y=round(col*width/4),round(row*height/2)
  endx,endy=round((col+1)*width/4),round((row+1)*height/2)
  alpha=image.crop((x,y,endx,endy)).getchannel('A')
  bbox=alpha.point(lambda a:255 if a>=32 else 0).getbbox()
  if not bbox:raise ValueError(f'{clip}: empty frame {index}')
  cells.append(dict(x=x,y=y,width=endx-x,height=endy-y,groundY=bbox[3],bodyHeight=bbox[3]-bbox[1]))
 frames[clip]=cells
 report[clip]={'source':filename,'size':[width,height],'mode':image.mode,'alpha':image.getchannel('A').getextrema()}
 target=destination/(clip+'.png')
 if target.exists() and target.read_bytes()!=(source/filename).read_bytes():raise ValueError(f'Existing source differs: {target}')
 shutil.copyfile(source/filename,target)
serialized=json.dumps(frames,indent=2)+'\n'
(destination/'frames.json').write_text(serialized,encoding='utf8')
(root/'src/game/ui/art/WindstriderFrames.json').write_text(serialized,encoding='utf8')
(destination/'sources.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report))
