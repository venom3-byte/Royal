/* Royal Shepherd Kingdom — systems-driven Canvas game. 5 min day, 10 min season. */
"use strict";
const C=document.getElementById("world"),ctx=C.getContext("2d",{alpha:false});
let W=innerWidth,H=innerHeight,DPR=1;
const TAU=Math.PI*2,DAY=300,SEASON=600;
const AS=window.RSK_ASSETS||{}, imgs={};
for(const [k,v] of Object.entries(AS)){imgs[k]=new Image();imgs[k].src=v}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;C.width=Math.floor(W*DPR);C.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener("resize",resize);resize();
const seasons=["ربيع","صيف","خريف","شتاء"], phases=["الفجر","النهار","الغروب","الليل"];
const weatherNames={clear:"صحو",rain:"مطر",fog:"ضباب",wind:"رياح",snow:"ثلج",heat:"موجة حر"};
const S={gold:120,wood:80,food:60,stone:35,day:1,score:0,hp:100,cap:12,pop:4,season:0,t:0,weather:"clear",quality:"auto",x:0,kingX:0,kingY:0,horse:true,paused:false};
const buildings=[{type:"castle",x:0,lv:1,hp:100}];
const units=[
{id:1,type:"worker",x:-120,hp:20,state:"work",job:"farm"},
{id:2,type:"worker",x:60,hp:20,state:"work",job:"wood"},
{id:3,type:"guard",x:180,hp:30,state:"patrol",rank:1},
{id:4,type:"farmer",x:-30,hp:20,state:"work",job:"farm"}];
const animals=[]; const enemies=[]; const projectiles=[]; const particles=[]; const clouds=[];
for(let i=0;i<36;i++)clouds.push({x:i*180+Math.random()*100,y:70+Math.random()*120,s:.5+Math.random()*.8});
for(let i=0;i<8;i++)animals.push({type:i%2?"sheep":"cow",x:-450+i*130,y:0,v:8+Math.random()*5,age:1,stress:0});
let running=false,gameOver=false,last=performance.now(),spawnTimer=0,weatherTimer=0,msg="ابنِ اقتصادك، جنّد الحرس، واستعد لليل.";
let moveL=false,moveR=false,drag=null,selected=null,qualityIndex=0;
const cost={farm:[30,0,0],pasture:[35,0,0],house:[35,0,0],wall:[0,25,0],tower:[70,0,0],barracks:[90,0,10],stable:[80,0,5],forge:[110,0,25],cannon:[150,0,20]};
const label={farm:"مزرعة",pasture:"مرعى",house:"مسكن",wall:"سور",tower:"برج",barracks:"ثكنة",stable:"إسطبل",forge:"حداد",cannon:"مدفع"};
const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function say(t){msg=t;document.getElementById("objective").textContent=t}
function phase(){const q=S.t%DAY;if(q<30)return 0;if(q<180)return 1;if(q<210)return 2;return 3}
function season(){return Math.floor((S.t%SEASON)/DAY)%4}
function night(){return phase()===3}
function ground(){return H*.72}
function sync(){
document.getElementById("gold").textContent=Math.floor(S.gold);document.getElementById("wood").textContent=Math.floor(S.wood);document.getElementById("food").textContent=Math.floor(S.food);document.getElementById("stone").textContent=Math.floor(S.stone);document.getElementById("population").textContent=S.pop+"/"+S.cap;
document.getElementById("season").textContent=seasons[S.season];document.getElementById("timeFill").style.width=((S.t%DAY)/DAY*100)+"%";
const q=S.t%DAY;const m=Math.floor(q/60),sec=Math.floor(q%60);document.getElementById("timeLabel").textContent=phases[phase()]+" · "+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0");document.getElementById("weather").textContent=weatherNames[S.weather];
}
function save(){localStorage.setItem("rsk_campaign",JSON.stringify({S,buildings,units,animals,enemies}));say("تم حفظ الحملة محليًا.")}
function load(){const raw=localStorage.getItem("rsk_campaign");if(!raw)return say("لا يوجد ملف حفظ.");try{const d=JSON.parse(raw);Object.assign(S,d.S);buildings.splice(0,buildings.length,...d.buildings);units.splice(0,units.length,...d.units);animals.splice(0,animals.length,...d.animals);enemies.splice(0,enemies.length,...d.enemies);sync();say("تم تحميل الحملة.");}catch(e){say("ملف الحفظ غير صالح.")}}
function reset(){localStorage.removeItem("rsk_campaign");location.reload()}
function addParticle(x,y,type="dust"){particles.push({x,y,vx:rnd(-30,30),vy:rnd(-80,-15),life:rnd(.35,.9),max:1,type})}
function spawnEnemy(){const side=Math.random()<.5?-1:1;enemies.push({x:S.x+side*(W/2+180),hp:4+Math.floor(S.day*.45),max:4+Math.floor(S.day*.45),v:18+S.day*.7,type:Math.random()<.12?"brute":"greed",attack:0})}
function recruitGuard(){if(S.gold<45||S.pop>=S.cap)return say(S.pop>=S.cap?"لا توجد مساكن كافية.":"تحتاج 45 عملة.");S.gold-=45;S.pop++;units.push({id:Date.now(),type:"guard",x:S.x+100,hp:30,max:30,state:"patrol",rank:1,weapon:"sword"});say("تم تجنيد حارس مبتدئ.")}
function build(type){
const c=cost[type];if(!c)return;if(S.gold<c[0]||S.wood<c[1]||S.stone<c[2])return say("الموارد غير كافية لبناء "+label[type]);
if(type==="house"&&S.cap>=36)return say("حد السكان الحالي وصل للحد الأعلى.");
S.gold-=c[0];S.wood-=c[1];S.stone-=c[2];const x=S.x+W*.18+rnd(-180,220);buildings.push({type,x,lv:1,hp:type==="wall"?80:100});
if(type==="house")S.cap+=4;if(type==="farm")S.food+=18;if(type==="pasture")animals.push({type:"cow",x,y:0,v:7,age:1,stress:0});
if(type==="barracks")say("اكتملت الثكنة: يمكنك الآن تجنيد الحرس.");
else if(type==="stable")S.horse=true;
else say("تم بناء "+label[type]+".");
sync()
}
function recruit(){const near=units.find(u=>u.type==="worker"&&Math.abs(u.x-S.x)<90);if(near)recruitGuard();else say("اقترب من عامل أو فلاح لتجنيده.")}
function interact(){
const e=enemies.find(e=>Math.abs(e.x-S.x)<120);if(e){attack(e);return}
const farm=buildings.find(b=>b.type==="farm"&&Math.abs(b.x-S.x)<150);if(farm){S.food+=3;say("تم حصاد جزء من المحصول.");return}
const animal=animals.find(a=>Math.abs(a.x-S.x)<100);if(animal){animal.stress=Math.max(0,animal.stress-1);S.food+=1;say(animal.type==="cow"?"حلبت بقرة.":"تفقدت القطيع.");return}
recruit()
}
function attack(e){e.hp-=2+Math.random()*2;for(let i=0;i<5;i++)addParticle(e.x,ground()-50,"spark");if(e.hp<=0){S.gold+=8;S.score+=10;const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);say("سقط عدو ليلي.");}else say("ضربة ناجحة.");}
function shoot(x,y,target,kind="arrow"){projectiles.push({x,y,tx:target.x,ty:ground()-45,v:260,life:2,kind})}
function ai(dt){
for(const u of units){
if(u.type==="worker"||u.type==="farmer"){u.x+=Math.sin(S.t*.8+u.id)*dt*(u.type==="farmer"?10:7);if(phase()===3)u.state="home";else u.state="work"}
if(u.type==="guard"){const threat=enemies.reduce((a,e)=>!a||Math.abs(e.x-u.x)<Math.abs(a.x-u.x)?e:a,null);if(threat&&Math.abs(threat.x-u.x)<250){u.state="combat";u.x+=Math.sign(threat.x-u.x)*dt*35;if(Math.abs(threat.x-u.x)<58){u.hit=(u.hit||0)+dt;if(u.hit>.75){u.hit=0;attack(threat)}}}else{u.state="patrol";u.x+=Math.sin(S.t+u.id)*dt*12}}
}
for(const a of animals){if(night())a.x+=Math.sign((a.x<0?-1:1))*a.v*dt*.3;else a.x+=Math.sin(S.t+a.x)*dt*a.v*.15}
for(const e of enemies){const target=S.x;e.x+=Math.sign(target-e.x)*e.v*dt;e.attack+=dt;if(Math.abs(e.x-target)<70&&e.attack>.9){e.attack=0;S.hp-=e.type==="brute"?8:4;for(let i=0;i<8;i++)addParticle(e.x,ground()-50,"hit")}}
}
function worldUpdate(dt){
if(S.paused||!running||gameOver)return;
S.t+=dt;S.day=1+Math.floor(S.t/DAY);S.season=season();
const oldDay=Math.floor((S.t-dt)/DAY),newDay=Math.floor(S.t/DAY);
if(newDay!==oldDay){S.gold+=25;S.wood+=12;S.food+=18;S.stone+=4;S.score+=50;say("شروق جديد: دخل الإنتاج اليومي إلى الخزينة.")}
weatherTimer-=dt;if(weatherTimer<=0){weatherTimer=rnd(95,135);const r=Math.random();S.weather=r<.45?"clear":r<.62?"rain":r<.75?"fog":r<.88?"wind":S.season===3?"snow":"heat";say("الطقس تغيّر إلى "+weatherNames[S.weather])}
spawnTimer-=dt;if(night()&&spawnTimer<=0){spawnTimer=Math.max(2.2,6-S.day*.08);const n=Math.min(1+Math.floor(S.day/3),5);for(let i=0;i<n;i++)spawnEnemy();if(enemies.length) say("موجة ليلية تقترب!")}
if(!night()&&enemies.length&&Math.random()<dt*.4)S.gold+=1;
ai(dt);
for(const p of projectiles){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);if(d<12){p.life=0;const e=enemies.find(e=>Math.abs(e.x-p.tx)<45);if(e)attack(e)}else{p.x+=dx/d*p.v*dt;p.y+=dy/d*p.v*dt;p.life-=dt}}
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=130*dt;p.life-=dt}
for(const b of buildings)if(b.type==="farm")S.food+=dt*(S.weather==="rain"?0.32:0.22);
S.gold+=dt*units.filter(u=>u.type==="worker").length*.08;
S.food=Math.max(0,S.food-dt*(S.pop*.018+(S.season===3?0.01:0)));
if(S.hp<=0){S.hp=0;gameOver=true;say("سقطت المملكة. افتح القائمة واختر حملة جديدة.")}
if(enemies.length>24)enemies.splice(0,enemies.length-24);
}
function gradientSky(){
const q=phase(),nightAmt=q===3?1:q===2?.5:q===0?.18:0;const palettes=[["#5aaed0","#d8e7d0"],["#5dbee1","#e9d9a7"],["#d48a55","#e5bf84"],["#101c35","#304864"]];const p=palettes[S.season];
const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
if(nightAmt){ctx.fillStyle="rgba(5,10,27,"+(nightAmt*.66)+")";ctx.fillRect(0,0,W,H)}
}
function drawBackground(){
gradientSky();const q=phase();ctx.save();ctx.translate(-(S.x*.16%180),0);for(const c of clouds){ctx.globalAlpha=S.weather==="fog"?.18:.35;ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(c.x,c.y,70*c.s,18*c.s,0,0,TAU);ctx.ellipse(c.x+35*c.s,c.y-10*c.s,45*c.s,24*c.s,0,0,TAU);ctx.fill()}ctx.restore();
const gy=ground();ctx.fillStyle=S.season===3?"#c8d0ca":S.season===2?"#7e784f":"#507b48";ctx.fillRect(0,gy,W,H-gy);
ctx.fillStyle=S.season===3?"#aab4ad":"#6e9456";for(let i=0;i<W/35+2;i++){const x=i*35-((S.x*.5)%35);ctx.fillRect(x,gy+12,20,3)}
for(let i=-2;i<W/120+3;i++){const x=i*120-((S.x*.35)%120),y=gy-20;drawTree(x,y,0.8+(i%3)*.1)}
if(S.weather==="rain"){ctx.strokeStyle="#b9e5ff66";ctx.lineWidth=1;for(let i=0;i<100;i++){const x=(i*83+S.t*120)%W;const y=(i*47+S.t*280)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+18);ctx.stroke()}}
if(S.weather==="snow"){ctx.fillStyle="#fff9";for(let i=0;i<80;i++){const x=(i*73+S.t*18)%W,y=(i*37+S.t*25)%H;ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.fill()}}
}
function drawTree(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#493522";ctx.fillRect(-6,-55,12,58);const leaves=S.season===2?"#526a38":S.season===3?"#718078":"#2f6744";ctx.fillStyle=leaves;for(const a of [[0,-78,35],[-22,-58,25],[22,-58,25]]){ctx.beginPath();ctx.arc(a[0],a[1],a[2],0,TAU);ctx.fill()}ctx.fillStyle="#4f7b4b";ctx.beginPath();ctx.arc(0,-91,17,0,TAU);ctx.fill();ctx.restore()}
function screenX(x){return x-S.x+W/2}
function drawBuilding(b){
const x=screenX(b.x),y=ground();if(x<-180||x>W+180)return;ctx.save();ctx.translate(x,y);
if(b.type==="castle"){ctx.fillStyle="#c5b8a0";ctx.fillRect(-70,-105,140,105);ctx.fillStyle="#7a2f2f";ctx.beginPath();ctx.moveTo(-80,-105);ctx.lineTo(-48,-138);ctx.lineTo(-18,-105);ctx.lineTo(18,-138);ctx.lineTo(48,-105);ctx.lineTo(80,-138);ctx.lineTo(80,-105);ctx.closePath();ctx.fill();ctx.fillStyle="#5b4435";ctx.fillRect(-14,-55,28,55);ctx.fillStyle="#e8bd57";ctx.fillRect(-52,-82,18,25);ctx.fillRect(34,-82,18,25);ctx.fillStyle="#f1cf76";ctx.fillRect(-7,-130,14,22)}
else if(b.type==="wall"){ctx.fillStyle="#6e6255";ctx.fillRect(-70,-48,140,48);ctx.fillStyle="#8f8170";for(let i=-60;i<70;i+=24)ctx.fillRect(i,-62,16,14)}
else if(b.type==="farm"){ctx.fillStyle="#765538";ctx.fillRect(-70,-8,140,8);for(let i=-58;i<65;i+=20){ctx.strokeStyle="#a8874d";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(i,-6);ctx.lineTo(i-10,-45);ctx.stroke()}ctx.fillStyle="#6da54d";for(let i=-50;i<60;i+=18){ctx.fillRect(i,-30,7,20)}}
else if(b.type==="pasture"){ctx.strokeStyle="#a87d4b";ctx.lineWidth=7;ctx.strokeRect(-65,-50,130,48);ctx.fillStyle="#6fa451";ctx.fillRect(-58,-7,116,7)}
else if(b.type==="house"){ctx.fillStyle="#b69b76";ctx.fillRect(-55,-65,110,65);ctx.fillStyle="#7b3632";ctx.beginPath();ctx.moveTo(-67,-65);ctx.lineTo(0,-110);ctx.lineTo(67,-65);ctx.closePath();ctx.fill();ctx.fillStyle="#4d3a2e";ctx.fillRect(-10,-40,20,40)}
else if(b.type==="tower"){ctx.fillStyle="#8e8373";ctx.fillRect(-30,-105,60,105);ctx.fillStyle="#6f312d";ctx.beginPath();ctx.moveTo(-38,-105);ctx.lineTo(0,-140);ctx.lineTo(38,-105);ctx.closePath();ctx.fill();ctx.fillStyle="#f1ca6a";ctx.fillRect(-9,-75,18,18)}
else if(b.type==="barracks"){ctx.fillStyle="#66584c";ctx.fillRect(-68,-65,136,65);ctx.fillStyle="#6c3030";ctx.beginPath();ctx.moveTo(-78,-65);ctx.lineTo(0,-105);ctx.lineTo(78,-65);ctx.closePath();ctx.fill();ctx.fillStyle="#d8bd79";ctx.fillRect(-40,-48,80,10)}
else if(b.type==="stable"){ctx.fillStyle="#704b31";ctx.fillRect(-72,-65,144,65);ctx.fillStyle="#8d352e";ctx.beginPath();ctx.moveTo(-80,-65);ctx.lineTo(0,-108);ctx.lineTo(80,-65);ctx.closePath();ctx.fill();ctx.fillStyle="#4d3425";ctx.fillRect(-25,-55,50,55)}
else if(b.type==="forge"){ctx.fillStyle="#554b45";ctx.fillRect(-55,-65,110,65);ctx.fillStyle="#5a3b32";ctx.fillRect(25,-120,18,55);ctx.fillStyle="#e78b35";ctx.fillRect(-12,-35,24,12)}
else if(b.type==="cannon"){ctx.fillStyle="#5d5b58";ctx.fillRect(-55,-18,110,18);ctx.fillStyle="#383b3b";ctx.beginPath();ctx.arc(-35,5,17,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(35,5,17,0,TAU);ctx.fill();ctx.fillStyle="#282b2b";ctx.rotate(-.12);ctx.fillRect(-5,-55,75,16)}
ctx.restore()
}
function drawUnit(u){
const x=screenX(u.x),y=ground();if(x<-80||x>W+80)return;ctx.save();ctx.translate(x,y-4);const bob=Math.sin(S.t*8+u.id)*2;
if(u.type==="worker"||u.type==="farmer"){ctx.fillStyle=u.type==="farmer"?"#4e7856":"#4f6682";ctx.fillRect(-10,-47+bob,20,27);ctx.fillStyle="#d6a47a";ctx.beginPath();ctx.arc(0,-57+bob,10,0,TAU);ctx.fill();ctx.fillStyle="#6b3d27";ctx.fillRect(-11,-67+bob,22,7)}
else if(u.type==="guard"){ctx.fillStyle=u.rank>=3?"#d6b55b":"#71808e";ctx.fillRect(-12,-55+bob,24,35);ctx.fillStyle="#b78d68";ctx.beginPath();ctx.arc(0,-64+bob,10,0,TAU);ctx.fill();ctx.fillStyle="#454e57";ctx.fillRect(-12,-72+bob,24,8);ctx.strokeStyle="#d7c18a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(13,-48);ctx.lineTo(27,-15);ctx.stroke()}
ctx.fillStyle="#252b32";ctx.fillRect(-11,-20,8,20);ctx.fillRect(3,-20,8,20);ctx.restore()
}
function drawAnimal(a){const x=screenX(a.x),y=ground();if(x<-80||x>W+80)return;ctx.save();ctx.translate(x,y-12);const leg=Math.sin(S.t*5+a.x)*3;ctx.fillStyle=a.type==="cow"?"#e1d4bd":"#eee7d9";ctx.beginPath();ctx.ellipse(0,-18,25,16,0,0,TAU);ctx.fill();ctx.fillStyle=a.type==="cow"?"#4a3b32":"#d6d0c6";ctx.beginPath();ctx.arc(24,-28,10,0,TAU);ctx.fill();ctx.fillStyle="#46352b";ctx.fillRect(-14,-5,5,15+leg);ctx.fillRect(10,-5,5,15-leg);ctx.strokeStyle="#44352c";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-23,-25);ctx.lineTo(-34,-31);ctx.stroke();ctx.restore()}
function drawEnemy(e){const x=screenX(e.x),y=ground();if(x<-80||x>W+80)return;ctx.save();ctx.translate(x,y-5);ctx.fillStyle=e.type==="brute"?"#4b2635":"#30283a";ctx.beginPath();ctx.ellipse(0,-36,15,28,0,0,TAU);ctx.fill();ctx.fillStyle="#b94e5a";ctx.beginPath();ctx.arc(0,-68,11,0,TAU);ctx.fill();ctx.fillStyle="#f5c96a";ctx.fillRect(-7,-69,4,3);ctx.fillRect(3,-69,4,3);ctx.strokeStyle="#6f3944";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,-18);ctx.lineTo(-18,4);ctx.moveTo(10,-18);ctx.lineTo(18,4);ctx.stroke();ctx.restore()}
function drawKing(){const x=W/2,y=ground()-3;ctx.save();ctx.translate(x,y);if(S.horse){ctx.fillStyle="#5b4030";ctx.beginPath();ctx.ellipse(0,-22,43,20,0,0,TAU);ctx.fill();ctx.fillStyle="#6e4932";ctx.beginPath();ctx.arc(39,-42,13,0,TAU);ctx.fill();ctx.strokeStyle="#4a3024";ctx.lineWidth=5;for(const dx of[-24,18]){ctx.beginPath();ctx.moveTo(dx,-8);ctx.lineTo(dx-4,18);ctx.stroke()}}ctx.fillStyle="#9c623f";ctx.fillRect(-9,-72,18,38);ctx.fillStyle="#d8a174";ctx.beginPath();ctx.arc(0,-82,11,0,TAU);ctx.fill();ctx.fillStyle="#d4ae55";ctx.beginPath();ctx.arc(0,-91,13,Math.PI,TAU);ctx.fill();ctx.strokeStyle="#d9c18b";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,-67);ctx.lineTo(27,-92);ctx.stroke();ctx.restore()}
function render(){
drawBackground();for(const b of buildings)drawBuilding(b);for(const a of animals)drawAnimal(a);for(const u of units)drawUnit(u);for(const e of enemies)drawEnemy(e);drawKing();
for(const p of particles){ctx.globalAlpha=cl(p.life/p.max,0,1);ctx.fillStyle=p.type==="spark"?"#ffd26a":p.type==="hit"?"#d85b56":"#d0b07b";ctx.fillRect(p.x-S.x+W/2,p.y,4,4);ctx.globalAlpha=1}
for(const p of projectiles){ctx.strokeStyle="#e9d28c";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-S.x+W/2,p.y);ctx.lineTo(p.x-S.x+W/2-10,p.y-3);ctx.stroke()}
if(night()){ctx.fillStyle="rgba(5,8,20,.2)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#e9e1b2";ctx.beginPath();ctx.arc(W-90,110,26,0,TAU);ctx.fill()}
if(gameOver){ctx.fillStyle="#02050acc";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="800 34px system-ui";ctx.fillText("سقطت المملكة",W/2,H/2-20);ctx.font="16px system-ui";ctx.fillText("افتح القائمة لبدء حملة جديدة",W/2,H/2+18);ctx.textAlign="start"}
}
function move(dt){if(!running||S.paused||gameOver)return;const speed=S.horse?145:100;if(moveL)S.x-=speed*dt;if(moveR)S.x+=speed*dt;S.x=cl(S.x,-2200,2200)}
function loop(now){const dt=Math.min(.045,(now-last)/1000);last=now;move(dt);worldUpdate(dt);render();sync();requestAnimationFrame(loop)}
document.querySelectorAll("[data-build]").forEach(b=>b.addEventListener("click",()=>build(b.dataset.build)));
document.getElementById("left").onpointerdown=()=>moveL=true;document.getElementById("left").onpointerup=()=>moveL=false;document.getElementById("left").onpointerleave=()=>moveL=false;
document.getElementById("right").onpointerdown=()=>moveR=true;document.getElementById("right").onpointerup=()=>moveR=false;document.getElementById("right").onpointerleave=()=>moveR=false;
document.getElementById("interact").onclick=interact;
document.getElementById("menu").onclick=()=>{S.paused=true;document.getElementById("modal").classList.remove("hidden");document.getElementById("stats").innerHTML=`<div>اليوم: <b>${S.day}</b></div><div>الفصل: <b>${seasons[S.season]}</b></div><div>الصحة: <b>${Math.floor(S.hp)}</b></div><div>النقاط: <b>${S.score}</b></div><div>الحرس: <b>${units.filter(u=>u.type==="guard").length}</b></div><div>الأعداء: <b>${enemies.length}</b></div>`};
document.getElementById("closeMenu").onclick=()=>{S.paused=false;document.getElementById("modal").classList.add("hidden")};
document.getElementById("save").onclick=save;document.getElementById("load").onclick=load;document.getElementById("reset").onclick=reset;
document.getElementById("quality").onclick=()=>{qualityIndex=(qualityIndex+1)%3;const q=["تلقائي","عالية","اقتصادية"][qualityIndex];S.quality=q;document.getElementById("quality").textContent="⚙ الجودة: "+q;say("تم تغيير الجودة إلى "+q)};
document.getElementById("startBtn").onclick=()=>{running=true;document.getElementById("start").style.display="none";say("بدأت الحملة. تحرّك، ابنِ، واجمع الموارد قبل الغروب.");sync()};
C.addEventListener("pointerdown",e=>{drag={x:e.clientX,last:e.clientX,t:performance.now()};});
C.addEventListener("pointermove",e=>{if(!drag||S.paused)return;const dx=e.clientX-drag.last;S.x-=dx*1.15;drag.last=e.clientX});
C.addEventListener("pointerup",()=>drag=null);C.addEventListener("pointercancel",()=>drag=null);
addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="a")moveL=true;if(e.key==="ArrowRight"||e.key==="d")moveR=true;if(e.key==="e"||e.key===" ")interact();if(e.key==="Escape"){S.paused=!S.paused;document.getElementById("modal").classList.toggle("hidden",!S.paused)}});
addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key==="a")moveL=false;if(e.key==="ArrowRight"||e.key==="d")moveR=false});
sync();requestAnimationFrame(loop);
