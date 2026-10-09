import { campTravelSeconds } from './CampMovement';
export function campMovementChecks():void {
  const short=campTravelSeconds(0,0,10,0,1000,1000);
  const long=campTravelSeconds(0,0,34,0,1000,1000);
  if(short!==2 || long!==4) throw Error('Camp speed must match 85 world pixels per second with a calm minimum');
  if(long!==campTravelSeconds(34,0,0,0,1000,1000)) throw Error('Return journey speed mismatch');
  const diagonal=campTravelSeconds(0,0,34,34,1000,1000);
  if(Math.abs(diagonal-4*Math.SQRT2)>.00001) throw Error('Diagonal movement must not be faster');
}
