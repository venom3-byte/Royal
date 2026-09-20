import {groundY} from "../systems.js";
export function drawEffects(ctx,state,W,H){
 const gy=groundY(H);
 for(const p of state.particles){const x=(p.x-state.camera.x)*state.camera.zoom+W/2,y=gy-p.y;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color||"#f2c36a";ctx.fillRect(x-2,y-2,4,4)}ctx.globalAlpha=1;
 for(const p of state.projectiles||[]){const x=(p.x-state.camera.x)*state.camera.zoom+W/2,y=gy-p.y;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(-p.vy,p.vx));ctx.fillStyle=p.type==="cannon"?"#272b2c":"#e1c28b";ctx.fillRect(-2,-2,p.type==="cannon"?18:14,4);ctx.restore()}
 if(state.weather==="rain"){ctx.strokeStyle="#bfe8ff77";for(let i=0;i<90;i++){const x=(i*91+state.time*160)%W,y=(i*43+state.time*260)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+17);ctx.stroke()}}
 if(state.weather==="snow"){ctx.fillStyle="#fff9";for(let i=0;i<70;i++){const x=(i*73+state.time*18)%W,y=(i*37+state.time*25)%H;ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill()}}
 if(state.weather==="fog"){ctx.fillStyle="#e8eeee44";ctx.fillRect(0,gy-60,W,150)}
 for(const f of state.fires){const x=(f.x-state.camera.x)*state.camera.zoom+W/2;ctx.fillStyle="#ff9b34aa";ctx.beginPath();ctx.arc(x,gy-28,10+Math.sin(state.time*8)*3,0,Math.PI*2);ctx.fill()}
}