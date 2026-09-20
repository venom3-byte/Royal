import {DAY_LENGTH,SEASON_LENGTH,PHASES,SEASONS,WEATHER,BUILDINGS,WEAPONS,SHELLS,CROPS,LIVESTOCK,UNIT_RANKS,ROYAL_FORMATIONS,QUALITY,MAX_PARTICLES} from "./config.js";
import {uid,makeBuilding,makeUnit,makeAnimal,makeCrop,makeEnemy,resourceCost,buildUnlock} from "./state.js";

export function currentPhase(state){const q=state.time%DAY_LENGTH;return PHASES.find(p=>q>=p.start&&q<p.end)||PHASES[0]}
export function isNight(state){return currentPhase(state).id==="night"}
export function seasonData(state){return SEASONS[state.seasonIndex%SEASONS.length]}
export function groundY(H){return H*.72}
export function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
export function rnd(a,b){return a+Math.random()*(b-a)}
export function notify(state,text,sound){state.notice=text;if(sound)sound.event(sound)}
function distance(a,b){return Math.abs(a-b)}
function aliveGuards(state){return state.units.filter(u=>u.type==="guard"||u.type==="royalGuard")}
function houses(state){return state.buildings.filter(b=>b.type==="house")}
function hasBuilding(state,type){return state.buildings.some(b=>b.type===type)}
function nearest(arr,x){let best=null,bd=Infinity;for(const e of arr){const d=Math.abs(e.x-x);if(d<bd){bd=d;best=e}}return best}

export function chooseWeather(state){
 const s=seasonData(state),pool=s.weather;
 state.weather=pool[Math.floor(Math.random()*pool.length)];
 state.weatherNext=rnd(95,125);
}
export function updateTime(state,dt,sound){
 if(!state.running||state.paused||state.gameOver)return {dayChanged:false,seasonChanged:false};
 const beforeDay=Math.floor(state.time/DAY_LENGTH),beforeSeason=Math.floor(state.time/SEASON_LENGTH)%4;
 state.time+=dt;
 state.day=1+Math.floor(state.time/DAY_LENGTH);
 state.seasonIndex=Math.floor(state.time/SEASON_LENGTH)%4;
 const dayChanged=beforeDay!==Math.floor(state.time/DAY_LENGTH);
 const seasonChanged=beforeSeason!==state.seasonIndex;
 if(dayChanged){state.stats.daysSurvived++;notify(state,"بدأ يوم جديد: دخل الإنتاج وجاهزية المملكة تتجدد.","dawn")}
 if(seasonChanged)notify(state,"بدأ فصل "+seasonData(state).name+" — العالم يتغيّر.", "dawn");
 state.weatherNext-=dt;
 if(state.weatherNext<=0){chooseWeather(state);notify(state,"الطقس الآن: "+WEATHER[state.weather].name,state.weather==="rain"?"rain":null)}
 return {dayChanged,seasonChanged};
}

export function build(state,type,sound){
 const d=BUILDINGS[type];if(!d||!buildUnlock(state,type))return notify(state,"هذا المبنى يحتاج ترقية للقلعة.");
 const r=state.resources;
 if(r.gold<d.gold||r.wood<d.wood||r.stone<d.stone)return notify(state,"الموارد غير كافية لبناء "+d.name);
 r.gold-=d.gold;r.wood-=d.wood;r.stone-=d.stone;
 const x=state.player.x+160+rnd(-120,220);
 state.buildings.push(makeBuilding(type,x));
 state.population.cap+=d.cap;
 if(type==="farm"){state.crops.push(makeCrop(state.seasonIndex===3?"winterWheat":"wheat",x-30));state.crops.push(makeCrop("wheat",x+20))}
 if(type==="pasture"){state.animals.push(makeAnimal("cow",x,{gender:"F"}));state.animals.push(makeAnimal("sheep",x+35,{gender:"M"}))}
 if(type==="stable")state.wagon.unlocked=true;
 notify(state,"تم بناء "+d.name,"build");sound?.event("build");
}

export function upgradeCastle(state,sound){
 const c=state.buildings.find(b=>b.type==="castle");if(!c)return;
 const cost={2:{gold:180,wood:120,stone:80},3:{gold:320,wood:190,stone:150},4:{gold:520,wood:300,stone:250}}[state.castle.level+1];
 if(!cost)return notify(state,"القلعة وصلت أعلى مستوى الحملة.");
 const r=state.resources;if(r.gold<cost.gold||r.wood<cost.wood||r.stone<cost.stone)return notify(state,"تحتاج موارد أكثر لترقية القلعة.");
 r.gold-=cost.gold;r.wood-=cost.wood;r.stone-=cost.stone;state.castle.level++;state.castle.maxHp+=75;state.castle.hp=state.castle.maxHp;c.level=state.castle.level;c.maxHp=state.castle.maxHp;c.hp=c.maxHp;
 notify(state,"ارتفعت القلعة إلى المستوى "+state.castle.level,"build");sound?.event("build");
}

export function recruit(state,kind="guard",sound){
 if(state.population.used>=state.population.cap)return notify(state,"لا توجد مساكن كافية.");
 if(kind==="guard"&&!hasBuilding(state,"barracks"))return notify(state,"ابنِ الثكنة أولًا.");
 if(kind==="hunter"&&!hasBuilding(state,"stable"))return notify(state,"ابنِ الإسطبل لتدريب الصياد.");
 const price=kind==="hunter"?60:45;if(state.resources.gold<price)return notify(state,"تحتاج "+price+" عملة.");
 state.resources.gold-=price;state.population.used++;
 const u=makeUnit(kind,state.player.x+90,{trainedAt:state.day,group:kind==="guard"?1:2});
 state.units.push(u);
 notify(state,kind==="hunter"?"تم تعيين صياد.":"تم تجنيد مجند. يحتاج يومًا للتدريب.","coin");sound?.event("coin");
}

export function trainAndPromote(state,sound){
 for(const u of state.units){
  if(u.type!=="guard"||u.rank>=3)continue;
  if(u.trainedAt && state.day-u.trainedAt>=1 && u.state!=="training"){
    u.rank=2;u.weapon="spear";u.maxHp=44;u.hp=u.maxHp;u.state="patrol";notify(state,"ترقّى أحد الحراس إلى مدرّب.","build");
  }
  if(u.rank===2&&state.day-u.trainedAt>=3&&state.castle.level>=2){u.rank=3;u.weapon="sword";u.maxHp=60;u.hp=u.maxHp}
 }
}

export function addRoyalGuard(state,sound){
 if(state.castle.level<3)return notify(state,"الحرس الملكي يفتح عند القلعة المستوى 3.");
 const count=state.units.filter(u=>u.type==="royalGuard").length;if(count>=Math.min(8,2+state.castle.level))return notify(state,"وصلت إلى الحد الحالي للحرس الملكي.");
 const price=120+count*35;if(state.resources.gold<price)return notify(state,"تحتاج "+price+" عملة.");
 state.resources.gold-=price;state.population.used++;
 state.units.push(makeUnit("royalGuard",state.player.x+(count-2)*42,{formationIndex:count}));
 notify(state,"انضم حارس ملكي إلى الموكب.","coin");sound?.event("coin");
}

export function setGuardOrder(state,order,targetX){
 for(const u of state.units)if(u.type==="guard"||u.type==="royalGuard"){u.order=order;u.orderTarget=targetX??u.orderTarget}
 notify(state,"تم إصدار أمر الحرس: "+({defend:"دفاع عن النقطة",attack:"هجوم",escort:"مرافقة",return:"عودة للثكنة"}[order]||order));
}
export function setRoyalFormation(state,formation){
 if(!ROYAL_FORMATIONS.includes(formation))return;
 state.player.formation=formation;notify(state,"تشكيل الحرس الملكي: "+({circle:"دائري",vanguard:"أمامي",spread:"متباعد"}[formation]||formation));
}

function updateCrop(state,c,dt){
 const d=CROPS[c.type],season=seasonData(state),weather=WEATHER[state.weather];
 const winterBlocked=season.id==="شتاء"&&!d.winter;
 if(c.ready||winterBlocked)return;
 const farms=state.buildings.filter(b=>b.type==="farm"&&Math.abs(b.x-c.x)<100).length;
 if(!farms)return;
 let rate=dt/(d.days*DAY_LENGTH)*season.growth*weather.growth;
 if(c.watered>0)rate*=1.2;
 c.progress=cl(c.progress+rate,0,1);c.stage=Math.min(d.stages-1,Math.floor(c.progress*d.stages));c.watered=Math.max(0,c.watered-dt);
 c.ready=c.progress>=1;
}
export function updateAgriculture(state,dt){
 for(const c of state.crops)updateCrop(state,c,dt);
 if(currentPhase(state).id==="dawn"&&Math.floor(state.time)%2<.2){
   for(const c of state.crops)if(c.ready){state.resources.food+=CROPS[c.type].base;state.stats.harvests++;c.progress=0;c.stage=0;c.ready=false}
 }
 if(state.weather==="rain")for(const c of state.crops)c.watered=4;
 const wells=state.buildings.filter(b=>b.type==="well").length;if(wells)for(const c of state.crops)c.watered=Math.max(c.watered,wells*1.5);
}
function feedRate(a){return a.type==="bull"?1.5:a.type==="cow"?1:a.type==="sheep"?.7:1}
export function updateLivestock(state,dt){
 const dusk=currentPhase(state).id==="dusk"||currentPhase(state).id==="night";
 for(const a of state.animals){
  a.age+=dt/600;a.hunger+=dt*feedRate(a)/80;if(a.type==="sheep")a.wool=cl(a.wool+dt*(100/900)*seasonData(state).growth,0,100);
  if(dusk)a.state="home";else a.state="graze";
  a.x+=Math.sin(state.time*.7+a.id)*dt*(a.type==="bull"?2.5:5);
  if(a.hunger>.85){a.health=cl(a.health-dt*.35,0,100);a.stress=cl(a.stress+dt*.02,0,100)}
  else a.hunger=cl(a.hunger-dt*.06,0,1);
  a.milkCooldown=Math.max(0,a.milkCooldown-dt);
  a.birthCooldown=Math.max(0,a.birthCooldown-dt);
 }
 if(Math.floor(state.time/SEASON_LENGTH)!==Math.floor((state.time-dt)/SEASON_LENGTH)){
   const females=state.animals.filter(a=>["cow","sheep"].includes(a.type)&&a.gender==="F"&&a.birthCooldown<=0);
   const males=state.animals.filter(a=>["bull","sheep"].includes(a.type)&&a.gender==="M");
   for(const f of females){if(males.some(m=>Math.abs(m.x-f.x)<150)){state.animals.push(makeAnimal(f.type,f.x+rnd(-15,15)));f.birthCooldown=1;}}
 }
 if(!dusk&&currentPhase(state).id==="dawn")for(const a of state.animals.filter(a=>a.type==="cow"&&a.milkCooldown<=0)){state.resources.milk+=3;a.milkCooldown=DAY_LENGTH*.5}
 state.foodConsumption=(state.foodConsumption||0)+dt*state.population.used*.016;
}
export function cullHungryAnimals(state){
 const over=state.animals.filter(a=>a.health<=0);if(over.length){for(const a of over){state.animals.splice(state.animals.indexOf(a),1)}}
}

export function butchering(state,sound){
 const shed=nearest(state.animals,state.player.x);if(!shed)return notify(state,"لا يوجد حيوان قريب.");
 const slaughter=nearest(state.buildings.filter(b=>b.type==="slaughterhouse"),state.player.x);
 if(!slaughter||distance(slaughter.x,state.player.x)>190)return notify(state,"اقترب من المسلخ.");
 const d=LIVESTOCK[shed.type];if(!d||d.meat<=0)return notify(state,"هذا الحيوان لا يصلح للذبح.");
 state.resources.food+=d.meat;state.resources.leather+=d.skin;state.resources.wool+=d.wool||0;state.resources.bones+=2;
 state.animals.splice(state.animals.indexOf(shed),1);state.stats.animalsProcessed++;notify(state,"خرجت موارد من المسلخ.","coin");sound?.event("animal");
}

export function milkOrShear(state,sound){
 const a=nearest(state.animals,state.player.x);if(!a)return notify(state,"لا يوجد حيوان قريب.");
 if(a.type==="cow"){if(a.milkCooldown>0)return notify(state,"هذه البقرة حُلِبت بالفعل.");state.resources.milk+=3;a.milkCooldown=DAY_LENGTH*.5;notify(state,"تم حلب البقرة.","animal");sound?.event("animal");return}
 if(a.type==="sheep"){if(a.wool<80)return notify(state,"الصوف لم يكتمل نموه.");state.resources.wool+=2;a.wool=0;notify(state,"تم جز صوف الخروف.","animal");sound?.event("animal");return}
 notify(state,"لا يوجد عمل مناسب لهذا الحيوان.");
}

export function hunt(state,sound){
 const hunter=nearest(state.units.filter(u=>u.type==="hunter"),state.player.x);if(!hunter||distance(hunter.x,state.player.x)>220)return notify(state,"يجب أن يكون الصياد قريبًا.");
 const target=nearest(state.animals.filter(a=>["sheep","cow"].includes(a.type)===false),hunter.x);
 if(target&&distance(target.x,hunter.x)<180){target.stress=100;state.resources.food+=8;state.resources.leather+=1;state.stats.hunts++;notify(state,"نجح الصياد في اصطياد فريسة.","bow");sound?.event("bow");state.animals.splice(state.animals.indexOf(target),1)}
 else notify(state,"لا توجد فريسة مناسبة الآن.");
}

export function fireCannon(state,sound){
 const cannon=nearest(state.buildings.filter(b=>b.type==="cannon"),state.player.x);
 if(!cannon||distance(cannon.x,state.player.x)>170)return notify(state,"اقترب من المدفع.");
 const shell=SHELLS[state.shell];const cost=shell.cost||{};for(const k in cost){if((state.resources[k]||0)<cost[k])return notify(state,"ذخيرة غير كافية.")}
 for(const k in cost)state.resources[k]-=cost[k];
 const wind=WEATHER[state.weather].wind||0;const angle=state.cannonAim;const speed=220+state.cannonPower*230;const vx=Math.cos(angle)*speed*(state.player.facing||1);const vy=Math.sin(angle)*speed;
 state.projectiles.push({id:uid(),type:"cannon",kind:state.shell,x:cannon.x+65,y:-52+groundY(700),vx,vy,life:5,gravity:110,damage:shell.damage,radius:shell.radius});
 state.stats.cannonShots++;state.camera.shake=12;notify(state,"تم إطلاق "+shell.name,"cannon");sound?.event("cannon");
}

export function cycleShell(state){
 const arr=Object.keys(SHELLS),i=arr.indexOf(state.shell);state.shell=arr[(i+1)%arr.length];notify(state,"نوع القذيفة: "+SHELLS[state.shell].name);
}

export function updateProjectiles(state,dt,sound){
 for(const p of state.projectiles){
  if(p.type==="cannon"){p.vx+=((WEATHER[state.weather].wind||0)*18)*dt;p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    const hitY=groundY(700)-8;
    if(p.y>=hitY||p.life<=0){explodeCannon(state,p,sound);p.life=0}
  }else{
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)continue;
    const hit=state.enemies.find(e=>Math.abs(e.x-p.x)<28&&Math.abs((e.y??(groundY(700)-48))-p.y)<55);if(hit){damageEnemy(state,hit,p.damage||8,p.kind==="bolt"?"pierce":"normal",sound);p.life=0}
  }
 }
 state.projectiles=state.projectiles.filter(p=>p.life>0);
}
function explodeCannon(state,p,sound){
 const shell=SHELLS[p.kind],radius=shell.radius||30;
 for(const e of state.enemies){const d=Math.abs(e.x-p.x);if(d<radius+(e.type==="brute"?18:8))damageEnemy(state,e,shell.damage*(1-d/(radius+40)),p.kind,sound)}
 if(p.kind==="fire")state.fires.push({x:p.x,life:shell.burn||5,radius});
 for(let i=0;i<24;i++)spawnParticle(state,p.x,p.y,"blast");
 state.camera.shake=18;
}
export function damageEnemy(state,e,damage,kind,sound){
 e.hp-=damage;e.stagger=.18;for(let i=0;i<5;i++)spawnParticle(state,e.x,groundY(700)-48,"hit");
 if(e.hp<=0){state.resources.gold+=e.type==="brute"?14:7;state.score+=e.type==="brute"?25:10;state.stats.kills++;state.enemies.splice(state.enemies.indexOf(e),1);sound?.event("hit")}
}

function enemyTarget(state,e){return nearest([...state.units.filter(u=>(u.type==="guard"||u.type==="royalGuard")&&u.hp>0),...state.buildings.filter(b=>(b.type==="wall"||b.type==="tower")&&b.hp>0),{x:state.player.x,type:"king"}],e.x)}
export function updateEnemies(state,dt,sound){
 for(const e of state.enemies){
  e.attackCooldown=Math.max(0,e.attackCooldown-dt);e.stagger=Math.max(0,e.stagger-dt);
  const target=enemyTarget(state,e);if(!target)continue;
  const targetX=target.x;
  if(e.stagger<=0)e.x+=Math.sign(targetX-e.x)*e.speed*dt*seasonData(state).night;
  if(Math.abs(e.x-targetX)<54&&e.attackCooldown<=0){
    e.attackCooldown=e.type==="brute"?1.25:.85;
    if(target.type==="king"){state.castle.hp=cl(state.castle.hp-(e.type==="brute"?12:6),0,state.castle.maxHp);state.camera.shake=8;sound?.event("hit")}
    else if(target.hp!=null){target.hp=cl(target.hp-(e.type==="brute"?10:5),0,target.maxHp??100)}
  }
 }
}
export function spawnNightWave(state,sound){
 if(!isNight(state))return;
 const waves=1+Math.floor(state.day/2),count=Math.min(2+Math.floor(state.day*.45),8);
 for(let i=0;i<count;i++){const side=Math.random()<.5?-1:1;state.enemies.push(makeEnemy(Math.random()<Math.min(.1+state.day*.012,.3)?"brute":"greed",state.player.x+side*(520+rnd(0,280)),state.day))}
 notify(state,"موجة الليل وصلت! "+waves+" مرحلة خطر.","alert");sound?.event("alert");
}

export function spawnParticle(state,x,y,type="dust"){
 const max=Math.round(MAX_PARTICLES*QUALITY[state.quality||"auto"].particles);
 if(state.particles.length>=max)return;
 state.particles.push({id:uid(),x,y,vx:rnd(-90,90),vy:rnd(-160,-20),life:rnd(.3,.9),max:1,type,size:rnd(2,5)});
}
export function updateParticles(state,dt){
 for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;p.life-=dt}
 state.particles=state.particles.filter(p=>p.life>0);
 for(const f of state.fires){f.life-=dt}state.fires=state.fires.filter(f=>f.life>0);
}
export function updateEconomy(state,dt,dayChanged){
 const season=seasonData(state),weather=WEATHER[state.weather];
 let workers=state.units.filter(u=>u.type==="worker"||u.type==="farmer").length;
 state.resources.gold+=dt*workers*.105;
 state.resources.wood+=dt*state.buildings.filter(b=>b.type==="farm").length*.035;
 if(dayChanged){
  state.resources.food+=20+workers*3+state.animals.filter(a=>a.type==="cow").length*2;
  state.resources.wood+=10+state.buildings.filter(b=>b.type==="farm").length*2;
  state.resources.gold+=18+state.buildings.filter(b=>b.type==="forge").length*3;
 }
 const drain=dt*state.population.used*(season.id==="winter"?.024:.017);
 state.resources.food=Math.max(0,state.resources.food-drain);
 if(state.resources.food<=1)for(const u of state.units)u.hp=Math.max(1,u.hp-dt*.8);
 if(weather==="rain")state.resources.food+=dt*.03*state.buildings.filter(b=>b.type==="farm").length;
 state.population.cap=14+houses(state).length*4;
}
export function updateUnits(state,dt,sound){
 const night=isNight(state),playerX=state.player.x;
 const royal=state.units.filter(u=>u.type==="royalGuard"),royalCount=royal.length;
 let staggerIndex=0;
 for(const u of state.units){
  if(!u.maxHp)u.maxHp=u.hp;
  if(night&&u.type==="worker"||night&&u.type==="farmer")u.state="home";else if(!night&&["worker","farmer"].includes(u.type))u.state="work";
  if(u.fireCooldown>0)u.fireCooldown-=dt;
  if(u.attackCooldown>0)u.attackCooldown-=dt;
  const q=QUALITY[state.quality||"auto"].aiDistance;
  if(staggerIndex++%3!==Math.floor(state.time*10)%3 && q<.7)continue;
  if(u.type==="worker"||u.type==="farmer"){
    const target=nearest(state.buildings.filter(b=>b.type==="farm"||b.type==="well"),u.x);
    if(target&&!night)u.x+=Math.sign(target.x-u.x)*dt*10;
    else u.x+=Math.sin(state.time+u.id)*dt*4;
  }else if(u.type==="hunter"){
    if(!night)u.x+=Math.sin(state.time*.7+u.id)*dt*13;
  }else if(u.type==="guard"){
    const threat=nearest(state.enemies,u.x);
    const orderedTarget=u.orderTarget??playerX;
    if(u.order==="defend")u.x+=Math.sign(orderedTarget-u.x)*dt*22;
    else if(u.order==="attack"&&u.orderTarget!=null)u.x+=Math.sign(u.orderTarget-u.x)*dt*34;
    else if(threat&&Math.abs(threat.x-u.x)<300){u.state="combat";u.x+=Math.sign(threat.x-u.x)*dt*40;if(Math.abs(threat.x-u.x)<WEAPONS[u.weapon].range&&u.attackCooldown<=0){attackUnit(state,u,threat,sound)}}
    else u.x+=Math.sin(state.time+u.id)*dt*9;
  }else if(u.type==="royalGuard"){
    const idx=u.formationIndex??0;
    const form=state.player.formation;
    const offsets=form==="circle"?Math.cos((idx/Math.max(royalCount,1))*Math.PI*2)*(65):form==="vanguard"?35:110;
    const targetX=playerX+(form==="circle"?offsets:(idx-(royalCount-1)/2)*42);
    const threat=nearest(state.enemies,u.x);
    if(threat&&Math.abs(threat.x-playerX)<220&&Math.abs(threat.x-u.x)<180){u.state="protect";u.x+=Math.sign(threat.x-u.x)*dt*58;if(Math.abs(threat.x-u.x)<65&&u.attackCooldown<=0)attackUnit(state,u,threat,sound)}
    else u.x+=Math.sign(targetX-u.x)*dt*38;
  }
  u.x=cl(u.x,playerX-900,playerX+900);
 }
}
function attackUnit(state,u,target,sound){
 const w=WEAPONS[u.weapon]||WEAPONS.sword;u.attackCooldown=w.rate;
 const damage=w.damage*(UNIT_RANKS[Math.max(0,(u.rank||1)-1)]?.mult||1);
 if(w.projectile){state.projectiles.push({id:uid(),type:"projectile",kind:w.projectile,x:u.x,y:-45+groundY(700),vx:Math.sign(target.x-u.x)*(w.range*1.8),vy:-80,life:1.5,gravity:75,damage}) ;sound?.event("bow")}
 else{damageEnemy(state,target,damage,"normal",sound);target.stagger=.15;sound?.event("metal")}
}
export function updateWagon(state,dt){
 if(!state.wagon.unlocked){state.wagon.active=false;return}
 const w=state.wagon;
 if(w.active){w.x=state.player.x;w.wheelAngle+=dt*(state.player.moving?6:1)}
}
export function boardWagon(state){if(!state.wagon.unlocked)return notify(state,"ابنِ الإسطبل أولًا.");state.wagon.active=!state.wagon.active;state.player.mode=state.wagon.active?"wagon":"foot";notify(state,state.wagon.active?"صعد الملك إلى العربة الملكية.":"ترجل الملك من العربة.","build")}
export function updateCastle(state){
 const c=state.buildings.find(b=>b.type==="castle");if(c)c.hp=state.castle.hp;
 if(state.castle.hp<=0)state.gameOver=true;
}

export function interact(state,sound){
 const e=nearest(state.enemies,state.player.x);if(e&&distance(e.x,state.player.x)<100){
   const k=state.player.mode==="wagon"?"bow":"sword";
   const w=WEAPONS[k]; if(w.projectile)state.projectiles.push({id:uid(),type:"projectile",kind:w.projectile,x:state.player.x,y:-50+groundY(700),vx:state.player.facing*w.range*1.7,vy:-90,life:1.4,gravity:80,damage:w.damage});
   else damageEnemy(state,e,w.damage,"normal",sound);
   sound?.event(w.projectile?"bow":"metal");return "attack";
 }
 const farm=nearest(state.buildings.filter(b=>b.type==="farm"),state.player.x);if(farm&&distance(farm.x,state.player.x)<120){const c=nearest(state.crops.filter(c=>c.ready),state.player.x);if(c){state.resources.food+=CROPS[c.type].base;state.stats.harvests++;c.progress=0;c.stage=0;c.ready=false;notify(state,"حصدت محصولًا جاهزًا.","coin");sound?.event("coin");return "harvest"}}
 const cannon=nearest(state.buildings.filter(b=>b.type==="cannon"),state.player.x);if(cannon&&distance(cannon.x,state.player.x)<170){fireCannon(state,sound);return "cannon"}
 const slaughter=nearest(state.buildings.filter(b=>b.type==="slaughterhouse"),state.player.x);if(slaughter&&distance(slaughter.x,state.player.x)<170){butchering(state,sound);return "butcher"}
 const animal=nearest(state.animals,state.player.x);if(animal&&distance(animal.x,state.player.x)<90){milkOrShear(state,sound);return "animal"}
 const worker=nearest(state.units.filter(u=>u.type==="worker"||u.type==="farmer"),state.player.x);if(worker&&distance(worker.x,state.player.x)<85){recruit(state,"guard",sound);return "recruit"}
 return null;
}

export function tick(state,dt,sound){
 const beforeNight=isNight(state);
 const change=updateTime(state,dt,sound);
 if(!state.running||state.paused||state.gameOver)return;
 if(!beforeNight&&isNight(state))spawnNightWave(state,sound);
 if(change.dayChanged)for(const e of state.enemies)e.hp+=1;
 trainAndPromote(state,sound);
 updateEconomy(state,dt,change.dayChanged);
 updateAgriculture(state,dt);
 updateLivestock(state,dt);
 cullHungryAnimals(state);
 const deadUnits=state.units.filter(u=>u.hp<=0);for(const u of deadUnits){state.population.used=Math.max(0,state.population.used-1);if(u.type==="guard"||u.type==="royalGuard")notify(state,"سقط أحد حماة المملكة.");state.units.splice(state.units.indexOf(u),1)}
 updateUnits(state,dt,sound);
 updateEnemies(state,dt,sound);
 updateProjectiles(state,dt,sound);
 updateParticles(state,dt);
 updateWagon(state,dt);
 updateCastle(state);
}
