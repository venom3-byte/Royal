export function setupInput(canvas,state,api){
 let keys={left:false,right:false},drag=null,lastPinch=0,longTimer=null;
 const setMove=(dir,v)=>{keys[dir]=v;state.player.moving=(keys.left?-1:0)+(keys.right?1:0)};
 canvas.addEventListener("pointerdown",e=>{
   api.audio?.init();api.audio?.resume();
   drag={x:e.clientX,last:e.clientX,id:e.pointerId,moved:false};
   try{canvas.setPointerCapture(e.pointerId)}catch{}
   if(longTimer)clearTimeout(longTimer);
   longTimer=setTimeout(()=>{longTimer=null;const unit=api.pickUnit(e.clientX,e.clientY);if(unit)api.openRadial(unit,e.clientX,e.clientY)},520);
 });
 canvas.addEventListener("pointermove",e=>{
   if(!drag)return;
   if(Math.abs(e.clientX-drag.x)>12&&longTimer){clearTimeout(longTimer);longTimer=null}
   const dx=e.clientX-drag.last;drag.last=e.clientX;
   if(Math.abs(dx)>1){drag.moved=true;state.player.x-=dx*1.08/state.camera.zoom;state.player.facing=dx<0?1:-1}
 });
 canvas.addEventListener("pointerup",e=>{
   if(longTimer){clearTimeout(longTimer);longTimer=null;if(!drag.moved)api.contextTap(e.clientX,e.clientY)}
   drag=null;try{canvas.releasePointerCapture(e.pointerId)}catch{}
 });
 canvas.addEventListener("pointercancel",()=>{drag=null;if(longTimer)clearTimeout(longTimer)});
 canvas.addEventListener("wheel",e=>{state.camera.targetZoom=Math.max(.82,Math.min(1.35,state.camera.targetZoom-e.deltaY*.0007))},{passive:true});
 addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="a")setMove("left",true);if(e.key==="ArrowRight"||e.key==="d")setMove("right",true);if(e.key==="e"||e.key===" ")api.interact()});
 addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key==="a")setMove("left",false);if(e.key==="ArrowRight"||e.key==="d")setMove("right",false)});
 api.setMove=setMove;
 return {keys};
}