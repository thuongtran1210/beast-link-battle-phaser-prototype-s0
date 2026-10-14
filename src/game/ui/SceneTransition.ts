let transitioning=false;
/** One short curtain bridges DOM screens and Phaser without a blank frame. */
export function transitionScreen(from:HTMLElement,next:()=>void, loading?: { title: string; message: string }):void {
  if(transitioning)return;
  transitioning=true;from.inert=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain=document.createElement('div');curtain.className='scene-transition-curtain';curtain.setAttribute('aria-hidden','true');
  document.getElementById('game-shell')!.append(curtain);
  if (loading) {
    curtain.classList.add('run-loading-screen');
    curtain.removeAttribute('aria-hidden');
    curtain.setAttribute('role', 'status');
    curtain.setAttribute('aria-live', 'polite');
    const content = document.createElement('div'); content.className = 'run-loading-content';
    content.innerHTML = '<span class="run-loading-brand">LÀNG THÚ</span><div class="run-loading-paws" aria-hidden="true"><svg viewBox="0 0 64 64"><ellipse cx="32" cy="43" rx="17" ry="13"/><ellipse cx="12" cy="25" rx="7" ry="9"/><ellipse cx="26" cy="15" rx="7" ry="9"/><ellipse cx="42" cy="17" rx="7" ry="9"/><ellipse cx="54" cy="30" rx="6" ry="8"/></svg></div>';
    const title = document.createElement('h1'); title.textContent = loading.title;
    const message = document.createElement('p'); message.className = 'run-loading-status'; message.textContent = loading.message;
    content.append(title, message); curtain.append(content);
  }
  const run=async()=>{
    try {
      if(!reduced)await curtain.animate([{opacity:0},{opacity:1}],{duration:140,easing:'ease-out',fill:'forwards'}).finished;
      next();
      if (loading) {
        const shell = document.getElementById('game-shell')!;
        // Wait for the new DOM screen's portraits, including cached images.
        const images = Array.from(shell.querySelectorAll<HTMLImageElement>('.deck-picker img'));
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.all([
            reduced ? Promise.resolve() : new Promise<void>(resolve => setTimeout(resolve, 400)),
            Promise.race([
              Promise.allSettled(images.map(image => image.decode())),
              new Promise<void>(resolve => { timeout = setTimeout(resolve, 8000); }),
            ]),
          ]);
        } finally { clearTimeout(timeout); }
      }
      if(!reduced){await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));await curtain.animate([{opacity:1},{opacity:0}],{duration:200,easing:'ease-in',fill:'forwards'}).finished;}
    } finally {curtain.remove();from.inert=false;transitioning=false;}
  };
  void run();
}
