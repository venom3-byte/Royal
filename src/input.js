export function setupInput(canvas,state,api){
 let drag=null,longTimer=null;
 const move=dir=>{state.player.x+=dir*3.2;state.player.facing=dir>0?1:-1;state.player.moving=dir};
 const stop=()=>state.player.moving=0;
 const bind=(id,dir)=>{const el=document.getElementById(id);if(!el)return;["pointerdown","touchstart"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();api.audio?.init();api.audio?.resume();move(dir)}));["pointerup","pointercancel","touchend","mouseleave"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();stop()}));};
 bind("left",-1);bind("right",1);
 canvas.addEventListener("pointerdown",e=>{
   api.audio?.init();api.audio?.resume();drag={x:e.clientX,last:e.clientX,moved:false,id:e.pointerId};
   try{canvas.setPointerCapture(e.pointerId)}catch{}
   longTimer=setTimeout(()=>{longTimer=null;const u=api.pickUnit(e.clientX,e.clientY);if(u)api.openRadial(u,e.clientX,e.clientY)},520);
 });
 canvas.addEventListener("pointermove",e=>{
   if(!drag)return;
   const dx=e.clientX-drag.last;drag.last=e.clientX;
   if(Math.abs(dx)>2){drag.moved=true;state.player.x-=dx*1.05/state.camera.zoom;state.player.facing=dx<0?1:-1}
 });
 canvas.addEventListener("pointerup",e=>{
   if(longTimer){clearTimeout(longTimer);longTimer=null;if(!drag?.moved)api.contextTap(e.clientX,e.clientY)}
   drag=null;try{canvas.releasePointerCapture(e.pointerId)}catch{}
 });
 canvas.addEventListener("pointercancel",()=>{if(longTimer)clearTimeout(longTimer);drag=null});
 canvas.addEventListener("wheel",e=>{state.camera.targetZoom=Math.max(.78,Math.min(1.45,state.camera.targetZoom-e.deltaY*.0008))},{passive:true});
 addEventListener("keydown",e=>{
   if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")move(-1);
   if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")move(1);
   if(e.key==="e"||e.key===" ")api.interact();
 });
 addEventListener("keyup",e=>{if(["ArrowLeft","ArrowRight","a","d"].includes(e.key))stop()});
 let pinch=0;
 canvas.addEventListener("touchmove",e=>{
   if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){state.camera.targetZoom=Math.max(.78,Math.min(1.45,state.camera.targetZoom+(d-pinch)*.003))}pinch=d}
 },{passive:false});
 canvas.addEventListener("touchend",()=>pinch=0);
 return {};
}