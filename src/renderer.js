import {TAU,WEATHER,SEASONS,BUILDINGS,LIVESTOCK,QUALITY} from "./config.js";
import {groundY} from "./systems.js";

export function createRenderer(canvas,assets){
 const ctx=canvas.getContext("2d",{alpha:false});
 let W=innerWidth,H=innerHeight,dpr=1;
 const imgs={};
 for(const [name,src] of Object.entries(assets||{})){const im=new Image();im.src=src;imgs[name]=im}
 function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
 addEventListener("resize",resize);resize();

 const phase=(s)=>{const q=s.time%300;return q<30?0:q<180?1:q<210?2:3};
 const sx=(s,x)=>(x-s.camera.x)*s.camera.zoom+W/2;
 const gy=()=>groundY(H);
 const img=(name,x,y,w,h,alpha=1,flip=false)=>{
   const im=imgs[name];if(!im||!im.complete||!im.naturalWidth)return false;
   ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
   if(flip)ctx.scale(-1,1);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();return true;
 };
 function sky(s){
   const pal=[["#67b7dc","#d8e5cb"],["#55b7df","#efd19a"],["#cf8158","#d8b27d"],["#111d35","#394d63"]][s.seasonIndex%4];
   const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   const p=phase(s),dark=[.08,0,.22,.72][p];ctx.fillStyle="rgba(5,9,22,"+dark+")";ctx.fillRect(0,0,W,H);
   const t=(s.time%300)/300;ctx.fillStyle=p===3?"#eee7bf":"#ffe6a1";ctx.globalAlpha=.9;
   ctx.beginPath();ctx.arc(p===3?W*.82:W*(.12+t*.7),p===3?H*.2:H*(.14+.16*Math.sin(t*Math.PI)),p===3?20:31,0,TAU);ctx.fill();ctx.globalAlpha=1;
 }
 function background(s){
   const base=gy()-8;
   ctx.fillStyle=s.seasonIndex===3?"#aeb9b7":"#52734f";ctx.fillRect(0,base,W,H-base);
   ctx.fillStyle="rgba(35,63,66,.32)";
   for(let i=-2;i<9;i++){const x=i*180-(s.camera.x*.12%180);ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x+90,base-75);ctx.lineTo(x+190,base);ctx.closePath();ctx.fill()}
   for(let i=-2;i<W/135+4;i++){const x=i*135-(s.camera.x*.3%135);ctx.fillStyle=s.seasonIndex===2?"#53643d":"#2f6248";ctx.beginPath();ctx.ellipse(x,base-52,42,50,0,0,TAU);ctx.fill();ctx.fillStyle="#493a2b";ctx.fillRect(x-5,base-20,10,24)}
   ctx.fillStyle=s.seasonIndex===3?"#d9dedc":"#77925c";ctx.fillRect(0,base+9,W,H-base);
   for(let i=-2;i<W/48+4;i++){const x=i*48-(s.camera.x*.65%48);ctx.fillRect(x,base+18,25,3)}
 }
 function building(b,s){
   const x=sx(s,b.x),y=gy();if(x<-180||x>W+180)return;
   const names={castle:"castle.png",wall:"wall.png",farm:"farm.png",house:"house.png",tower:"tower.png"};
   const n=names[b.type];
   const sizes={castle:[190,150],wall:[145,65],farm:[130,75],house:[120,90],tower:[75,145]};
   if(n&&img(n,x,y,sizes[b.type][0],sizes[b.type][1]))return;
   ctx.save();ctx.translate(x,y);
   ctx.fillStyle="#806c55";ctx.fillRect(-55,-55,110,55);ctx.fillStyle="#873b35";ctx.beginPath();ctx.moveTo(-65,-55);ctx.lineTo(0,-100);ctx.lineTo(65,-55);ctx.closePath();ctx.fill();ctx.restore();
 }
 function otherBuilding(b,s){
   const x=sx(s,b.x),y=gy();if(x<-180||x>W+180)return;
   if(["castle","wall","farm","house","tower"].includes(b.type)){building(b,s);return}
   const color={pasture:"#8c7047",barracks:"#5c5050",stable:"#765133",forge:"#4b4742",cannon:"#444849",slaughterhouse:"#6b4b42",quarantine:"#806d4f",well:"#777064"}[b.type]||"#665";
   ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.fillRect(-55,-58,110,58);
   ctx.fillStyle="#8e3837";ctx.beginPath();ctx.moveTo(-63,-58);ctx.lineTo(0,-94);ctx.lineTo(63,-58);ctx.closePath();ctx.fill();
   if(b.type==="cannon"){ctx.fillStyle="#262a2b";ctx.fillRect(-6,-78,82,15);ctx.fillStyle="#343839";ctx.beginPath();ctx.arc(-38,5,16,0,TAU);ctx.arc(38,5,16,0,TAU);ctx.fill()}
   if(b.type==="forge"){ctx.fillStyle="#ff9c3c";ctx.beginPath();ctx.arc(0,-30,16+Math.sin(s.time*8)*3,0,TAU);ctx.fill()}
   ctx.restore();
 }
 function crop(c,s){
   const x=sx(s,c.x),y=gy()-4;if(x<-30||x>W+30)return;
   const h=[3,11,23,36][c.stage]||3;ctx.fillStyle=c.stage===3?"#e0b84d":"#6e9e4b";
   for(let i=-13;i<=13;i+=8){ctx.fillRect(x+i,y-h,3,h);if(c.stage>1)ctx.fillRect(x+i-3,y-h+6,10,3)}
   if(c.ready){ctx.fillStyle="#fff1a8";ctx.beginPath();ctx.arc(x,y-h-4,4,0,TAU);ctx.fill()}
 }
 function character(u,s){
   const x=sx(s,u.x),y=gy()-2;if(x<-70||x>W+70)return;
   const flip=u.facing<0;
   const key=u.type==="hunter"?"archer.png":(u.type==="worker"||u.type==="farmer"?"farmer.png":"king.png");
   const bob=Math.sin(s.time*8+u.id)*2;
   const w=u.type==="royalGuard"?52:46,h=u.type==="royalGuard"?70:62;
   if(!img(key,x,y+bob,w,h,1,flip)){
     ctx.fillStyle=u.type==="royalGuard"?"#d8b65f":u.type==="guard"?"#65707c":"#5d7959";ctx.fillRect(x-12,y-52+bob,24,45);
   }
   if(u.hp<u.maxHp){ctx.fillStyle="#241d1c";ctx.fillRect(x-18,y-78,36,4);ctx.fillStyle="#69d078";ctx.fillRect(x-18,y-78,36*Math.max(0,u.hp/u.maxHp),4)}
   if(u.type==="guard"||u.type==="royalGuard"){ctx.strokeStyle=u.type==="royalGuard"?"#f1d06a":"#d6c08a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+14,y-40);ctx.lineTo(x+30,y-8);ctx.stroke()}
 }
 function animal(a,s){
   const x=sx(s,a.x),y=gy()-8;if(x<-70||x>W+70)return;
   const key=a.type==="sheep"?"farmer.png":a.type==="horse"?"king.png":"farmer.png";
   const sc=a.type==="bull"?1.05:a.type==="sheep"?.82:1;
   const bob=Math.sin(s.time*5+a.id)*2;
   if(!img(key,x,y+bob,58*sc,52*sc,1,a.x>s.player.x)) {
     ctx.fillStyle=a.type==="sheep"?"#eee":"#c7b49b";ctx.beginPath();ctx.ellipse(x,y-24,28*sc,17*sc,0,0,TAU);ctx.fill();
   }
 }
 function enemy(e,s){
   const x=sx(s,e.x),y=gy()-4;if(x<-70||x>W+70)return;
   const bob=Math.sin(s.time*7+e.id)*2;
   if(!img("enemy.png",x,y+bob,54,66,1,e.x>s.player.x)){
     ctx.fillStyle="#3a2535";ctx.beginPath();ctx.arc(x,y-42,17,0,TAU);ctx.fill();ctx.fillRect(x-13,y-28,26,28)
   }
 }
 function king(s){
   const x=W/2,y=gy()-2,bob=Math.sin(s.time*7)*2;
   if(s.wagon.active){
     ctx.save();ctx.translate(x,y+1);
     ctx.fillStyle="#6e472d";ctx.fillRect(-78,-52,156,45);ctx.fillStyle="#b8874f";ctx.fillRect(-65,-92,130,40);
     for(const dx of[-57,57]){ctx.fillStyle="#2d2d2d";ctx.beginPath();ctx.arc(dx,3,18,0,TAU);ctx.fill();ctx.strokeStyle="#b9a37c";ctx.lineWidth=4;ctx.stroke()}
     ctx.restore();
   }
   img("king.png",x,y+bob,58,72,1,s.player.facing<0);
 }
 function projectile(p,s){
   const x=sx(s,p.x),y=gy()-p.y;if(x<-30||x>W+30)return;
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(-p.vy,p.vx));ctx.fillStyle=p.type==="cannon"?"#272b2c":"#e1c28b";ctx.fillRect(-2,-2,p.type==="cannon"?18:14,4);ctx.restore();
 }
 function particles(s){
   for(const p of s.particles){const x=sx(s,p.x),y=gy()-p.y;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color||"#f2c36a";ctx.fillRect(x-2,y-2,4,4)}ctx.globalAlpha=1;
 }
 function weather(s){
   if(s.weather==="rain"){ctx.strokeStyle="#bfe8ff77";for(let i=0;i<100;i++){const x=(i*91+s.time*160)%W,y=(i*43+s.time*260)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+17);ctx.stroke()}}
   if(s.weather==="snow"){ctx.fillStyle="#fff9";for(let i=0;i<75;i++){const x=(i*73+s.time*18)%W,y=(i*37+s.time*25)%H;ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.fill()}}
   if(s.weather==="fog"){ctx.fillStyle="#e8eeee44";ctx.fillRect(0,gy()-50,W,160)}
 }
 function uiWorld(s){
   const x=sx(s,s.player.x),y=gy();ctx.strokeStyle="#e8c46a66";ctx.beginPath();ctx.moveTo(x-35,y+1);ctx.lineTo(x+35,y+1);ctx.stroke();
   if(s.enemies.length){ctx.fillStyle="#ef6a5c";ctx.font="bold 12px system-ui";ctx.fillText("موجة ليلية: "+s.enemies.length,x-48,y-105)}
 }
 function render(s){
   s.camera.zoom+=(s.camera.targetZoom-s.camera.zoom)*.1;s.camera.shake*=.88;
   ctx.save();if(s.camera.shake>.2)ctx.translate((Math.random()-.5)*s.camera.shake,(Math.random()-.5)*s.camera.shake);
   sky(s);background(s);
   for(const b of s.buildings)otherBuilding(b,s);
   for(const c of s.crops)crop(c,s);
   for(const a of s.animals)animal(a,s);
   for(const u of s.units)character(u,s);
   for(const e of s.enemies)enemy(e,s);
   for(const p of s.projectiles)projectile(p,s);
   king(s);particles(s);weather(s);uiWorld(s);ctx.restore();
 }
 return {render,size:{get W(){return W},get H(){return H}}};
}
