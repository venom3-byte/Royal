import {TAU,WEATHER,SEASONS,BUILDINGS,LIVESTOCK,SHELLS,QUALITY} from "./config.js";
import {groundY,phase as unusedPhase} from "./systems.js";

export function createRenderer(canvas,assets){
 const ctx=canvas.getContext("2d",{alpha:false});
 let W=innerWidth,H=innerHeight,dpr=1;
 function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 addEventListener("resize",resize);resize();

 function phaseIndex(state){const q=state.time%300;return q<30?0:q<180?1:q<210?2:3}
 function screenX(state,x){return (x-state.camera.x)*state.camera.zoom+W/2}
 function gY(){return groundY(H)}

 function sky(state){
  const palettes=[["#65b3d2","#d8e4c9"],["#5ab8df","#ead09a"],["#d18457","#d7b378"],["#14243d","#364c63"]];
  const p=palettes[state.seasonIndex%4],q=phaseIndex(state);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const darkness=[.08,0,.22,.67][q];if(darkness){ctx.fillStyle="rgba(5,9,22,"+darkness+")";ctx.fillRect(0,0,W,H)}
  const sunX=W*.16+((state.time%300)/300)*W*.65,sunY=q===0?H*.25:q===2?H*.25:H*.14;
  ctx.globalAlpha=q===3?.2:1;ctx.fillStyle=q===3?"#e7e2bb":"#ffe0a0";ctx.beginPath();ctx.arc(q===3?W*.84:sunX,sunY,q===3?24:34,0,TAU);ctx.fill();ctx.globalAlpha=1;
 }
 function clouds(state){
  const count=QUALITY[state.quality].decor>.9?10:6;
  for(let i=0;i<count;i++){let x=(i*190-state.camera.x*.12+(state.time*4))%(W+180)-90,y=70+(i%4)*32;ctx.fillStyle="rgba(255,255,255,.16)";ctx.beginPath();ctx.ellipse(x,y,68,18,0,0,TAU);ctx.ellipse(x+35,y-9,43,25,0,0,TAU);ctx.fill()}
 }
 function terrain(state){
  const gy=gY();const season=state.seasonIndex;
  ctx.fillStyle=season===3?"#cdd5d2":season===2?"#77784d":"#527e49";ctx.fillRect(0,gy,W,H-gy);
  ctx.fillStyle=season===3?"#abb6b3":"#749a5b";
  for(let i=-2;i<W/44+3;i++){const x=i*44-(state.camera.x*.55%44);ctx.fillRect(x,gy+12,22,3)}
  for(let i=-2;i<W/150+4;i++){drawTree(i*150-(state.camera.x*.32%150),gy-10,.84+(i%3)*.08,state)}
 }
 function drawTree(x,y,s,state){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);const sway=(state.weather==="wind"?Math.sin(state.time*2+x)*3:0);
  ctx.fillStyle="#483421";ctx.fillRect(-7,-62,14,65);ctx.fillStyle=state.seasonIndex===2?"#5d7038":state.seasonIndex===3?"#78837e":"#316546";
  for(const q of [[0,-86,38],[-23,-66,27],[24,-66,27]]){ctx.beginPath();ctx.ellipse(q[0]+sway*.2,q[1],q[2],q[2]*.82,0,0,TAU);ctx.fill()}
  if(state.seasonIndex===2){ctx.fillStyle="#b18942";for(let i=0;i<5;i++){ctx.fillRect(-34+i*16,-45+Math.sin(i)*7,4,8)}}
  ctx.restore();
 }
 function building(b,state){
  const x=screenX(state,b.x),y=gY();if(x<-200||x>W+200)return;
  ctx.save();ctx.translate(x,y);
  const night=phaseIndex(state)===3;
  if(b.type==="castle"){
   ctx.fillStyle="#b9ac96";ctx.fillRect(-88,-118,176,118);ctx.fillStyle="#6f2d2c";ctx.beginPath();ctx.moveTo(-96,-118);ctx.lineTo(-62,-150);ctx.lineTo(-28,-118);ctx.lineTo(0,-154);ctx.lineTo(28,-118);ctx.lineTo(62,-150);ctx.lineTo(96,-118);ctx.closePath();ctx.fill();
   ctx.fillStyle="#5a4537";ctx.fillRect(-18,-61,36,61);ctx.fillStyle=night?"#ffd66b":"#765a3f";ctx.fillRect(-60,-88,24,28);ctx.fillRect(36,-88,24,28);ctx.fillStyle="#d7b45b";ctx.fillRect(-8,-148,16,28);
  }else if(b.type==="wall"){ctx.fillStyle="#655d55";ctx.fillRect(-75,-48,150,48);ctx.fillStyle="#82786c";for(let i=-66;i<70;i+=25)ctx.fillRect(i,-63,17,15)}
  else if(b.type==="farm"){ctx.fillStyle="#63472f";ctx.fillRect(-72,-8,144,8);for(let i=-60;i<62;i+=19){ctx.strokeStyle="#ad8c52";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(i,-6);ctx.lineTo(i-10,-48);ctx.stroke()}ctx.fillStyle="#70a548";for(let i=-48;i<60;i+=17){ctx.fillRect(i,-33,7,24)}}
  else if(b.type==="pasture"){ctx.strokeStyle="#ac814c";ctx.lineWidth=7;ctx.strokeRect(-68,-50,136,50);ctx.fillStyle="#6ca24d";ctx.fillRect(-60,-7,120,7)}
  else if(b.type==="house"){ctx.fillStyle="#b6966e";ctx.fillRect(-58,-65,116,65);ctx.fillStyle="#7b3633";ctx.beginPath();ctx.moveTo(-69,-65);ctx.lineTo(0,-112);ctx.lineTo(69,-65);ctx.closePath();ctx.fill();ctx.fillStyle="#4d3529";ctx.fillRect(-11,-42,22,42);if(night){ctx.fillStyle="#ffd97b";ctx.fillRect(-43,-48,15,17);ctx.fillRect(28,-48,15,17)}}
  else if(b.type==="tower"){ctx.fillStyle="#8e8374";ctx.fillRect(-33,-112,66,112);ctx.fillStyle="#6c302f";ctx.beginPath();ctx.moveTo(-41,-112);ctx.lineTo(0,-146);ctx.lineTo(41,-112);ctx.closePath();ctx.fill();if(night){ctx.fillStyle="#ffd56b";ctx.fillRect(-10,-76,20,20)}}
  else if(b.type==="barracks"){ctx.fillStyle="#665b51";ctx.fillRect(-72,-67,144,67);ctx.fillStyle="#713333";ctx.beginPath();ctx.moveTo(-82,-67);ctx.lineTo(0,-112);ctx.lineTo(82,-67);ctx.closePath();ctx.fill();ctx.fillStyle="#cdb37a";ctx.fillRect(-44,-49,88,10)}
  else if(b.type==="stable"){ctx.fillStyle="#704b31";ctx.fillRect(-80,-66,160,66);ctx.fillStyle="#873833";ctx.beginPath();ctx.moveTo(-89,-66);ctx.lineTo(0,-112);ctx.lineTo(89,-66);ctx.closePath();ctx.fill();ctx.fillStyle="#4d3324";ctx.fillRect(-28,-56,56,56)}
  else if(b.type==="forge"){ctx.fillStyle="#514942";ctx.fillRect(-60,-70,120,70);ctx.fillStyle="#5b3f35";ctx.fillRect(27,-130,20,60);ctx.fillStyle="#ef8f35";ctx.fillRect(-15,-40,30,12);if(night){ctx.fillStyle="#ffb64e";ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(0,-34,26,0,TAU);ctx.fill();ctx.globalAlpha=1}}
  else if(b.type==="cannon"){ctx.fillStyle="#5d5b57";ctx.fillRect(-65,-20,130,20);ctx.fillStyle="#363939";ctx.beginPath();ctx.arc(-42,5,18,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(42,5,18,0,TAU);ctx.fill();ctx.save();ctx.rotate(-.16);ctx.fillStyle="#292c2d";ctx.fillRect(-8,-66,92,17);ctx.restore()}
  else if(b.type==="slaughterhouse"){ctx.fillStyle="#70534b";ctx.fillRect(-68,-68,136,68);ctx.fillStyle="#8a3735";ctx.beginPath();ctx.moveTo(-76,-68);ctx.lineTo(0,-109);ctx.lineTo(76,-68);ctx.closePath();ctx.fill();ctx.fillStyle="#3a2d29";ctx.fillRect(-24,-50,48,50);ctx.fillStyle="#7e2020";ctx.fillRect(34,-86,20,8)}
  else if(b.type==="quarantine"){ctx.strokeStyle="#8e7650";ctx.lineWidth=7;ctx.strokeRect(-70,-55,140,55);ctx.fillStyle="#8a7c55";ctx.fillRect(-58,-45,116,8)}
  else if(b.type==="well"){ctx.fillStyle="#877762";ctx.beginPath();ctx.arc(0,-10,31,0,TAU);ctx.fill();ctx.fillStyle="#4e7590";ctx.beginPath();ctx.ellipse(0,-18,18,9,0,0,TAU);ctx.fill();ctx.strokeStyle="#6b4f37";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-26,-69);ctx.lineTo(26,-69);ctx.stroke()}
  ctx.restore();
 }
 function crop(c,state){
  const x=screenX(state,c.x),y=gY();if(x<-40||x>W+40)return;
  const stage=c.stage;ctx.save();ctx.translate(x,y-9);ctx.fillStyle="#6c4a32";ctx.fillRect(-18,6,36,3);
  const height=[0,9,19,31][stage];const col=stage===3?"#d8b24f":"#75a950";ctx.fillStyle=col;for(let i=-13;i<=13;i+=7){ctx.fillRect(i,-height,3,height+5);if(stage>1){ctx.fillRect(i,-height+5,9,3)}}
  if(c.ready){ctx.fillStyle="#ffe6a1";ctx.beginPath();ctx.arc(0,-36,4,0,TAU);ctx.fill()}ctx.restore();
 }
 function unit(u,state){
  const x=screenX(state,u.x),y=gY();if(x<-60||x>W+60)return;ctx.save();ctx.translate(x,y-4);const bob=Math.sin(state.time*8+u.id)*2;
  if(u.type==="worker"||u.type==="farmer"){ctx.fillStyle=u.type==="farmer"?"#547b55":"#526989";ctx.fillRect(-11,-48+bob,22,28);ctx.fillStyle="#d6a27a";ctx.beginPath();ctx.arc(0,-59+bob,10,0,TAU);ctx.fill();ctx.fillStyle="#6b4028";ctx.fillRect(-12,-69+bob,24,7);if(u.state==="work"){ctx.strokeStyle="#c6a264";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-42);ctx.lineTo(23,-23);ctx.stroke()}}
  else if(u.type==="hunter"){ctx.fillStyle="#466f49";ctx.fillRect(-12,-52+bob,24,33);ctx.fillStyle="#d7a17c";ctx.beginPath();ctx.arc(0,-62+bob,10,0,TAU);ctx.fill();ctx.strokeStyle="#b99359";ctx.lineWidth=3;ctx.beginPath();ctx.arc(15,-45,16,Math.PI*1.1,Math.PI*1.8);ctx.stroke()}
  else {const royal=u.type==="royalGuard",elite=u.rank>=3;ctx.fillStyle=royal?"#d6b45c":elite?"#8f8e89":"#717d87";ctx.fillRect(-12,-58+bob,24,38);ctx.fillStyle="#bd916c";ctx.beginPath();ctx.arc(0,-68+bob,10,0,TAU);ctx.fill();ctx.fillStyle=royal?"#f2cf6a":"#464d54";ctx.fillRect(-13,-76+bob,26,9);ctx.strokeStyle=royal?"#f2d27f":"#d2bc85";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-51);ctx.lineTo(28,-17);ctx.stroke();if(royal){ctx.strokeStyle="#ffffff88";ctx.strokeRect(-14,-61,28,10)}}
  ctx.fillStyle="#262b31";ctx.fillRect(-11,-20,8,20);ctx.fillRect(3,-20,8,20);
  if(u.hp<u.maxHp){ctx.fillStyle="#2a201e";ctx.fillRect(-18,-89,36,4);ctx.fillStyle="#65c56c";ctx.fillRect(-18,-89,36*Math.max(0,u.hp/u.maxHp),4)}
  ctx.restore();
 }
 function animal(a,state){
  const x=screenX(state,a.x),y=gY();if(x<-70||x>W+70)return;ctx.save();ctx.translate(x,y-12);const leg=Math.sin(state.time*5+a.id)*3,scale=LIVESTOCK[a.type]?.size||1;
  ctx.scale(scale,scale);ctx.fillStyle=a.type==="cow"?"#d8c8b0":a.type==="bull"?"#55493e":"#eee7dd";ctx.beginPath();ctx.ellipse(0,-22,27,17,0,0,TAU);ctx.fill();ctx.fillStyle=a.type==="sheep"?"#d1ccc4":"#4e3f35";ctx.beginPath();ctx.arc(26,-31,10,0,TAU);ctx.fill();ctx.fillStyle="#403229";ctx.fillRect(-16,-6,5,15+leg);ctx.fillRect(11,-6,5,15-leg);ctx.strokeStyle="#42332a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-25,-27);ctx.lineTo(-36,-34);ctx.stroke();if(a.stress>60){ctx.strokeStyle="#e16d5f";ctx.beginPath();ctx.arc(0,-50,18,Math.PI*1.1,Math.PI*1.8);ctx.stroke()}ctx.restore();
 }
 function enemy(e,state){const x=screenX(state,e.x),y=gY();if(x<-80||x>W+80)return;ctx.save();ctx.translate(x,y-5);const brute=e.type==="brute";ctx.fillStyle=brute?"#4a2431":"#2d2638";ctx.beginPath();ctx.ellipse(0,-39,brute?19:15,brute?31:27,0,0,TAU);ctx.fill();ctx.fillStyle="#b84d58";ctx.beginPath();ctx.arc(0,-70,11,0,TAU);ctx.fill();ctx.fillStyle="#ffd56b";ctx.fillRect(-7,-71,4,3);ctx.fillRect(3,-71,4,3);ctx.strokeStyle="#723946";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,-19);ctx.lineTo(-19,3);ctx.moveTo(10,-19);ctx.lineTo(19,3);ctx.stroke();ctx.restore()}
 function king(state){
  const x=W/2,y=gY()-4;ctx.save();ctx.translate(x,y);const wagon=state.wagon.active;
  if(wagon){ctx.fillStyle="#765034";ctx.fillRect(-78,-50,156,46);ctx.fillStyle="#a66d3f";ctx.fillRect(-70,-94,140,45);ctx.fillStyle="#d2ad72";ctx.beginPath();ctx.arc(-44,-96,7,0,TAU);ctx.arc(44,-96,7,0,TAU);ctx.fill();ctx.strokeStyle="#3e2e25";ctx.lineWidth=7;for(const dx of[-56,56]){ctx.beginPath();ctx.arc(dx,3,18,0,TAU);ctx.stroke()}ctx.fillStyle="#d5b56c";ctx.beginPath();ctx.arc(0,-86,19,Math.PI,TAU);ctx.fill()} 
  ctx.fillStyle="#9c623f";ctx.fillRect(-10,-73,20,40);ctx.fillStyle="#d9a477";ctx.beginPath();ctx.arc(0,-83,11,0,TAU);ctx.fill();ctx.fillStyle="#d7b45d";ctx.beginPath();ctx.arc(0,-92,13,Math.PI,TAU);ctx.fill();ctx.strokeStyle="#dbc68e";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(11,-67);ctx.lineTo(29,-94);ctx.stroke();ctx.restore();
 }
 function weather(state){
  if(state.weather==="rain"){ctx.strokeStyle="#b9e6ff55";ctx.lineWidth=1;for(let i=0;i<90;i++){const x=(i*83+state.time*125)%W,y=(i*47+state.time*300)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+19);ctx.stroke()}}
  if(state.weather==="snow"){ctx.fillStyle="#ffffffaa";for(let i=0;i<80;i++){const x=(i*73+state.time*17)%W,y=(i*37+state.time*26)%H;ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.fill()}}
  if(state.weather==="fog"){ctx.fillStyle="#dbe4e455";ctx.fillRect(0,gY()-20,W,130)}
 }
 function render(state){
  const quality=QUALITY[state.quality||"auto"];state.camera.zoom+=(state.camera.targetZoom-state.camera.zoom)*.08;state.camera.shake*=.88;
  ctx.save();if(state.camera.shake>.2)ctx.translate((Math.random()-.5)*state.camera.shake,(Math.random()-.5)*state.camera.shake);
  sky(state);clouds(state);terrain(state);
  const allB=[...state.buildings].sort((a,b)=>a.x-b.x);for(const b of allB)building(b,state);
  for(const c of state.crops)crop(c,state);
  const animals=[...state.animals];for(const a of animals)animal(a,state);
  for(const u of state.units)unit(u,state);
  for(const e of state.enemies)enemy(e,state);
  for(const f of state.fires){ctx.fillStyle="#f08a2b66";ctx.beginPath();ctx.arc(screenX(state,f.x),gY()-14,Math.max(8,f.radius*.55),0,TAU);ctx.fill();ctx.fillStyle="#ffca4d";ctx.beginPath();ctx.arc(screenX(state,f.x),gY()-28,10+Math.sin(state.time*8)*3,0,TAU);ctx.fill()}
  for(const p of state.projectiles){ctx.strokeStyle=p.type==="cannon"?"#5d4036":"#e8d493";ctx.lineWidth=p.type==="cannon"?5:2;ctx.beginPath();ctx.moveTo(screenX(state,p.x),p.y);ctx.lineTo(screenX(state,p.x-p.vx*.035),p.y-p.vy*.02);ctx.stroke()}
  for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.type==="spark"?"#ffd56b":p.type==="hit"?"#db615b":p.type==="blast"?"#f29a45":"#bca276";ctx.fillRect(screenX(state,p.x),p.y,p.size,p.size);ctx.globalAlpha=1}
  king(state);weather(state);ctx.restore();
 }
 return {render,resize,get size(){return {W,H}}};
}