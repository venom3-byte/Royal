export function setupInput(canvas,state,api){
 let pointer=null;let pinchDistance=0;
 const setIntent=v=>{state.player.moveIntent=v;state.player.moving=v};
 const bindHold=(id,dir)=>{const el=document.getElementById(id);if(!el)return;el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);api.audio?.init();api.audio?.resume();setIntent(dir)},{passive:false});["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();if(state.player.moveIntent===dir)setIntent(0)},{passive:false}))};
 bindHold("left",-1);bindHold("right",1);
 canvas.addEventListener("pointerdown",e=>{api.audio?.init();api.audio?.resume();pointer={x:e.clientX,lastX:e.clientX,lastY:e.clientY,moved:false,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!pointer)return;const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;pointer.lastX=e.clientX;pointer.lastY=e.clientY;if(Math.abs(dx)+Math.abs(dy)>2){pointer.moved=true;state.camera.x-=dx/state.camera.zoom*1.05}});
 canvas.addEventListener("pointerup",e=>{if(pointer&&!pointer.moved)api.contextTap?.(e.clientX,e.clientY);pointer=null;canvas.releasePointerCapture?.(e.pointerId)});
 canvas.addEventListener("pointercancel",()=>pointer=null);
 canvas.addEventListener("wheel",e=>{e.preventDefault();state.camera.targetZoom=Math.max(.75,Math.min(1.45,state.camera.targetZoom-e.deltaY*.0008))},{passive:false});
 canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinchDistance)state.camera.targetZoom=Math.max(.75,Math.min(1.45,state.camera.targetZoom+(d-pinchDistance)*.003));pinchDistance=d}},{passive:false});
 canvas.addEventListener("touchend",()=>pinchDistance=0);
 addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k==="a"||e.key==="ArrowLeft")setIntent(-1);if(k==="d"||e.key==="ArrowRight")setIntent(1);if(k==="e"||e.key===" ")api.contextTap?.(innerWidth/2,innerHeight/2)});
 addEventListener("keyup",e=>{const k=e.key.toLowerCase();if((k==="a"||e.key==="ArrowLeft")&&state.player.moveIntent<0)setIntent(0);if((k==="d"||e.key==="ArrowRight")&&state.player.moveIntent>0)setIntent(0)});
 return {setIntent};
}