let transitioning=false;
/** One short curtain bridges DOM screens and Phaser without a blank frame. */
export function transitionScreen(from:HTMLElement,next:()=>void):void {
  if(transitioning)return;
  transitioning=true;from.inert=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain=document.createElement('div');curtain.className='scene-transition-curtain';curtain.setAttribute('aria-hidden','true');
  document.getElementById('game-shell')!.append(curtain);
  const run=async()=>{
    try {
      if(!reduced)await curtain.animate([{opacity:0},{opacity:1}],{duration:140,easing:'ease-out',fill:'forwards'}).finished;
      next();
      if(!reduced){await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));await curtain.animate([{opacity:1},{opacity:0}],{duration:200,easing:'ease-in',fill:'forwards'}).finished;}
    } finally {curtain.remove();from.inert=false;transitioning=false;}
  };
  void run();
}
