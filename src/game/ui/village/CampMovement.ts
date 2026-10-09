/** World pixels / second; duration is shared by CSS and the activity clock. */
export function campTravelSeconds(fromX:number,fromY:number,toX:number,toY:number,width:number,height:number):number {
  return Math.max(2,Math.hypot((toX-fromX)*width/100,(toY-fromY)*height/100)/85);
}
