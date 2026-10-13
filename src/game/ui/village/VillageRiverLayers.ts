/** Preserve source alpha and registration; animate only the texture under shore. */
export function mountVillageRiverLayers(world:HTMLElement):()=>void {
  let disposed=false;
  const shore=new Image(),water=new Image();
  const ready=()=>{
    if(!disposed && shore.complete && shore.naturalWidth>0 && water.complete && water.naturalWidth>0) world.classList.add('village-river-ready');
  };
  shore.onload=ready;water.onload=ready;
  shore.src='/assets/ui/camp/river-owner-v1/shore.png';
  water.src='/assets/ui/camp/river-owner-v1/water.png';
  const visibility=()=>{world.classList.toggle('village-water-paused',document.hidden);world.parentElement?.classList.toggle('village-atmosphere-paused',document.hidden);};
  document.addEventListener('visibilitychange',visibility);visibility();
  return ()=>{disposed=true;shore.onload=null;water.onload=null;document.removeEventListener('visibilitychange',visibility);world.classList.remove('village-river-ready');};
}
