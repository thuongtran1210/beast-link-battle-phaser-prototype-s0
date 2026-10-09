import { villageCloseScale, villageOverviewScale, villageClampCamera } from './VillageCameraLayout';
export function villageCameraLayoutChecks():void {
  for(const [w,h] of [[390,844],[844,390],[667,375],[1910,880]]) {
    const close=villageCloseScale(w,h);
    if(close*1536<w || close*1024<h) throw Error('Village close camera must fill viewport without side gutters');
    if(close*92<44) throw Error('Resident touch width below 44px in close view');
    const fit=villageOverviewScale(w,h);
    if(fit*1536>w+.01 || fit*1024>h+.01) throw Error('Overview must retain entire map');
    for(const [x,y] of [[-1e6,-1e6],[1e6,1e6]]) {
      const p=villageClampCamera(w,h,close,x,y);
      if(p.x>0 || p.y>0 || p.x+1536*close<w-.01 || p.y+1024*close<h-.01) throw Error('Camera pan exposed background');
    }
  }
}
