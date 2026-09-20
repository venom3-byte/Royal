import {groundY} from "../systems.js";
export function drawBackground(ctx,state,W,H){
 const base=groundY(H),season=state.seasonIndex%4,q=state.time%300,night=q>=210,wind=state.weather==="wind"||season===2;
 const pal=[["#68b8dd","#d9e4c9"],["#57b9df","#efd29d"],["#d18459","#d9b57f"],["#111c34","#3d5064"]][season];
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const dark=night?.72:q>=180?.22:q<30?.08:0;ctx.fillStyle="rgba(7,12,20,"+dark+")";ctx.fillRect(0,0,W,H);
 const t=q/300;ctx.fillStyle=night?"#eee9c6":"#ffe5a4";ctx.beginPath();ctx.arc(night?W*.82:W*(.12+t*.68),night?H*.18:H*(.14+.15*Math.sin(t*Math.PI)),night?20:31,0,Math.PI*2);ctx.fill();
 for(let i=-3;i<8;i++){const x=i*190-(state.camera.x*.12%190)+((state.time*5)%(W+190));const y=70+(i%4)*26;ctx.fillStyle="#ffffff22";ctx.beginPath();ctx.ellipse(x% (W+190)-60,y,68,18,0,0,Math.PI*2);ctx.ellipse(x%(W+190)-25,y-9,43,25,0,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle=season===3?"#b7c1bf":"#50734d";ctx.fillRect(0,base-7,W,H-base+7);
 for(let i=-3;i<W/170+5;i++){const x=i*170-(state.camera.x*.15%170),sway=Math.sin(state.time*1.5+i)* (wind?5:2);ctx.fillStyle=season===2?"#586840":"#2f6249";ctx.beginPath();ctx.ellipse(x+sway,base-58,44,48,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#49392a";ctx.fillRect(x-4,base-20,8,23)}
 ctx.fillStyle=season===3?"#d6dddc":"#78945d";ctx.fillRect(0,base+8,W,H-base);
 for(let i=-2;i<W/48+5;i++){const x=i*48-(state.camera.x*.65%48);ctx.fillStyle=season===3?"#bac3c1":"#6f8d57";ctx.fillRect(x,base+18,25,3)}
}