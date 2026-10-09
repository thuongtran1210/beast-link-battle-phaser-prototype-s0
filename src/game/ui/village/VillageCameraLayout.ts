export function villageCloseScale(width:number,height:number):number {
  return Math.max(.65,width/1536,height/1024);
}
export function villageOverviewScale(width:number,height:number):number {
  return Math.min(width/1536,height/1024);
}
export function villageClampCamera(width:number,height:number,scale:number,x:number,y:number):{x:number;y:number} {
  return {x:width>=1536*scale?(width-1536*scale)/2:Math.min(0,Math.max(width-1536*scale,x)),
    y:height>=1024*scale?(height-1024*scale)/2:Math.min(0,Math.max(height-1024*scale,y))};
}
