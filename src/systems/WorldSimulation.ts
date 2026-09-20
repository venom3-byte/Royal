import {GameState,BUILD_COSTS} from "../core/Types";import {TimeManager} from "../core/TimeManager";
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const moveToward=(x:number,target:number,max:number)=>x+clamp(target-x,-max,max);
function dist(a:number,b:number){return Math.abs(a-b)}
export class WorldSimulation{
 moveX=0;attack=false;coin=false;build=false;upgrade=false;
 private spawnTimer=0;private resourceTimer=0;private trainTimer=0;private seasonSeen=0;
 constructor(public state:GameState,public time:TimeManager){this.seasonSeen=state.seasonIndex||0}
 update(dt:number){
  const s=this.state;tweakState(s);t.update(dt);
  s.time=t.elapsed;s.day=t.day;s.seasonIndex=t.seasonIndex;s.weather=t.weather;
  this.player(dt);this.aiVillagers(dt);this.aiAnimals(dt);this.growCrops(dt);this.economy(dt);this.night(dt);this.defenses(dt);this.projectiles(dt);
  if(this.attack){this.attack=false;this.melee()}if(this.coin){this.coin=false;this.recruit()}if(this.build){this.build=false;this.place()}if(this.upgrade){this.upgrade=false;this.castleUpgrade()}
  this.cleanup();
 }
 player(dt:number){
  const s=this.state,p=s.player;const desired=this.moveX*155*(tweak(this.time));p.vx+=(desired-p.vx)*Math.min(1,dt*10);p.x+=p.vx*dt;
  for(const b of s.buildings){const solid=b.kind==="wall"||b.kind==="gate"||b.kind==="castle"||b.kind==="tower";if(solid&&dist(p.x,b.x)<48)p.x=b.x+(p.x<b.x?-48:48)}\n  p.x=clamp(p.x,-2350,2350);p.facing=Math.abs(p.vx)>.5?(p.vx>0?1:-1):p.facing;p.animTime+=dt*Math.max(.4,Math.abs(p.vx)/90);
  if(Math.abs(p.vx)<2)p.stamina=clamp(p.stamina+24*dt,0,100);else p.stamina=clamp(p.stamina-8*dt,0,100);
  p.attackTimer=Math.max(0,p.attackTimer-dt);
 }
 aiVillagers(dt:number){
  const s=this.state;
  for(const u of s.units){
   u.animTime+=dt*Math.max(.35,Math.abs(u.vx)/55);
   const target=this.villagerTarget(u);
   const speed=u.role==="guard"?72:u.role==="archer"?60:u.role==="builder"?52:u.role==="farmer"?48:40;
   u.vx=(target===undefined?0:clamp(target-u.x,-speed,speed));
   u.x+=u.vx*dt;u.y=0;
   if(Math.abs(u.vx)>4)u.state=u.role==="guard"||u.role==="archer"?"patrol":"work";else if(u.role==="farmer"||u.role==="builder")u.state="work";else u.state="idle";
   for(const other of s.units){if(other===u)continue;const d=u.x-other.x;if(Math.abs(d)<24&&Math.abs(d)>0.1){u.x+=d>0?3:-3}}\n   const e=this.closestEnemy(u.x);if(e&&dist(e.x,u.x)<120){u.state="fight";u.vx=0;if(u.role==="guard")e.hp-=dt*(10+u.rank*5);if(u.role==="archer"&&Math.random()<dt*.8)this.arrow(u.x,52,e.x)}
  }
  this.trainTimer+=dt;if(this.trainTimer>22){this.trainTimer=0;const yard=s.buildings.find(b=>b.kind==="training");const v=s.units.find(u=>u.role==="villager"&&yard&&dist(u.x,yard.x)<120);if(v&&s.resources.iron>=3){s.resources.iron-=3;v.role="guard";v.rank=1;v.state="patrol"}}
 }
 villagerTarget(u:any){
  const s=this.state,p=s.player;
  if(this.time.phase==="night"){
   if(u.role==="farmer"||u.role==="builder"||u.role==="villager")return u.homeX;
   return s.flags.reduce((best:number,x:number)=>dist(x,p.x)<dist(best,p.x)?x:best,s.flags[0]??0);
  }
  if(u.role==="farmer"){const c=s.crops.filter(c=>c.stage<3).sort((a,b)=>dist(a.x,u.x)-dist(b.x,u.x))[0];return c?.x??180}
  if(u.role==="builder"){const b=s.buildings.filter(b=>b.hp<b.maxHp).sort((a,b)=>dist(a.x,u.x)-dist(b.x,u.x))[0];return b?.x??u.homeX}
  if(u.role==="guard"||u.role==="archer"){const e=this.closestEnemy(u.x);return e&&dist(e.x,u.x)<380?e.x:(s.flags[u.id.charCodeAt(1)%s.flags.length]??u.homeX)}
  return u.homeX+Math.sin(s.time*.18+u.homeX)*75;
 }
 aiAnimals(dt:number){
  const s=this.state,barn=s.buildings.find(b=>b.kind==="barn");const lo=(barn?.x??335)-115,hi=(barn?.x??335)+115;
  for(const a of s.animals){
   a.animTime+=dt*(.5+Math.abs(a.vx)/35);a.y=0;a.hunger=clamp(a.hunger+dt*.7,0,100);
   if(a.wild){this.wildAnimal(a,dt);continue}
   const night=this.time.phase==="night"||this.time.phase==="dusk";
   if(night){a.state="rest";a.vx=(lo+a.x>hi?hi:a.x<lo?lo:a.x-a.x)*0;a.x=moveToward(a.x,clamp(a.x,lo,hi),45*dt)}
   else if(a.hunger>65){a.state="eat";const gx=lo+((Math.floor(a.age*2)%5)/5)*(hi-lo);a.vx=clamp(gx-a.x,-20,20);a.x+=a.vx*dt;if(dist(a.x,gx)<8)a.hunger=15}
   else{a.state="graze";const target=lo+((Math.sin(a.age*.7)+1)/2)*(hi-lo);a.vx=clamp(target-a.x,-14,14);a.x+=a.vx*dt}
   if(Math.random()<dt*.004&&a.hunger<55)s.resources.milk++;
  }
 }
 wildAnimal(a:any,dt:number){
  const s=this.state,d=dist(a.x,s.player.x);if(d<230)a.state="flee";else a.state="graze";
  const speed=a.kind==="rabbit"?70:a.kind==="wolf"?48:a.kind==="bison"?30:38;
  if(a.state==="flee")a.vx=(a.x<s.player.x?-1:1)*speed;else a.vx=Math.sin(s.time*.25+a.age)*speed*.35;
  a.x+=a.vx*dt;
  if(a.x<-2350)a.x=-2350;if(a.x>2350)a.x=2350;
 }
 growCrops(dt:number){
  const s=this.state;
  for(const c of s.crops){
   let rate=this.time.season==="spring"?1.15:this.time.season==="summer"?1:this.time.season==="autumn"?.8:0;
   if(this.time.season==="winter"&&c.kind!=="winter")rate=0;if(this.time.weather==="rain")rate*=1.15;if(this.time.weather==="heat")rate*=.7;
   if(this.time.weather==="wind")c.windPhase+=dt*2;
   if(rate>0&&c.stage<3){c.age+=dt*rate;c.health=clamp(c.health+(c.water>10?dt*.3:-dt*.5),0,100);const progress=c.age/900;if(progress>=.75)c.stage=3;else if(progress>=.5)c.stage=2;else if(progress>=.25)c.stage=1}
   const farmer=s.units.find(u=>u.role==="farmer"&&dist(u.x,c.x)<34);
   if(farmer&&c.stage===3&&this.time.phase!=="night"){s.resources.food+=1;c.age=0;c.stage=0;c.water=60}
   c.water=clamp(c.water-(this.time.weather==="rain"?-dt*2:dt*.8),0,100);
  }
 }
 economy(dt:number){
  this.resourceTimer+=dt;if(this.resourceTimer<10)return;this.resourceTimer=0;const s=this.state;
  const builders=s.units.filter(u=>u.role==="builder").length,farms=s.units.filter(u=>u.role==="farmer").length;
  s.resources.wood=clamp(s.resources.wood+builders*2,0,999);s.resources.stone=clamp(s.resources.stone+Math.max(1,Math.floor(builders/2)),0,999);
  s.resources.food=clamp(s.resources.food+farms,0,999);
  if(s.resources.milk>20){s.resources.milk-=20;s.resources.food+=3}
  if(this.time.phase==="dawn")s.resources.coins+=Math.max(0,Math.floor(s.units.length/3));
 }
 night(dt:number){
  const s=this.state;if(this.time.phase!=="night"){this.spawnTimer=0;return}this.spawnTimer+=dt;
  if(this.spawnTimer<11)return;this.spawnTimer=0;const side=Math.random()<.5?-1:1,hard=1+(s.day-1)*.11+(this.time.season==="winter"?.25:0),brute=Math.random()<Math.min(.4,.08+s.day*.012),hp=Math.round((brute?130:55)*hard);
  s.enemies.push({id:"e"+Date.now()+Math.random(),x:s.player.x+side*(560+Math.random()*220),hp,maxHp:hp,speed:(brute?20:34)*hard,damage:brute?10:4,kind:brute?"brute":Math.random()<.25?"scout":"greedling"});s.wave=Math.floor(s.day/2)+1;
  for(const e of s.enemies){e.x+=Math.sign(s.player.x-e.x)*e.speed*dt;const wall=s.buildings.filter(b=>b.kind==="wall"||b.kind==="gate"||b.kind==="tower").sort((a,b)=>dist(a.x,e.x)-dist(b.x,e.x))[0];if(wall&&dist(wall.x,e.x)<30){wall.hp-=e.damage*dt;e.x-=Math.sign(s.player.x-e.x)*e.speed*dt}else if(dist(e.x,s.player.x)<38)s.player.health-=e.damage*dt}
 }
 defenses(dt:number){
  const s=this.state;if(this.time.phase!=="night")return;
  for(const b of s.buildings){const e=this.closestEnemy(b.x);if(!e||dist(e.x,b.x)>380)continue;
   if(b.kind==="tower"&&Math.random()<dt*.7)this.arrow(b.x,52,e.x);
   if(b.kind==="cannon"&&s.resources.oil>0&&s.resources.iron>0&&Math.random()<dt*.25){s.resources.oil--;s.resources.iron--;s.projectiles.push({id:"pc"+Date.now()+Math.random(),x:b.x,y:52,vx:Math.sign(e.x-b.x)*240,vy:-250,damage:85,kind:"cannon",life:3})}
  }
 }
 projectiles(dt:number){
  const s=this.state;for(let i=s.projectiles.length-1;i>=0;i--){const p=s.projectiles[i];p.life-=dt;p.vy+=430*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;let hit=false;
   for(const e of s.enemies)if(dist(e.x,p.x)<25&&p.y>5&&p.y<90){e.hp-=p.damage;hit=true;break}
   if(p.life<=0||p.y>95||hit)s.projectiles.splice(i,1)
  }
 }
 melee(){
  const s=this.state,p=s.player;if(p.attackTimer>0)return;p.attackTimer=.42;const range=p.weapon==="spear"?112:p.weapon==="axe"?94:82,dmg=p.weapon==="axe"?42:p.weapon==="spear"?29:24;
  for(const e of s.enemies)if(dist(e.x,p.x)<range&&Math.sign(e.x-p.x)===p.facing)e.hp-=dmg;
 }
 recruit(){
  const s=this.state,v=s.units.find(u=>u.role==="villager"&&dist(u.x,s.player.x)<180);if(v){v.role="farmer";v.state="work";return}
  if(s.resources.coins<1)return;s.resources.coins--;s.units.push({id:"u"+Date.now()+Math.random(),role:"villager",rank:1,x:s.player.x+s.player.facing*70,y:0,vx:0,hp:70,maxHp:70,state:"idle",homeX:s.player.x+s.player.facing*70,animTime:0});
 }
 place(){
  const s=this.state,c=BUILD_COSTS[s.selectedBuild];if(!Object.entries(c).every(([k,v])=>(s.resources as any)[k]>=(v as number)))return;
  for(const [k,v] of Object.entries(c))if(v)(s.resources as any)[k]-=v as number;
  const hp:any={wall:180,tower:260,farm:160,barn:240,blacksmith:260,training:250,house:180,cannon:220};
  const x=Math.round((s.player.x+s.player.facing*120)/10)*10;
  if(s.buildings.some(b=>dist(b.x,x)<70))return;
  s.buildings.push({id:"b"+Date.now()+Math.random(),kind:s.selectedBuild,x,level:1,hp:hp[s.selectedBuild],maxHp:hp[s.selectedBuild]});
 }
 castleUpgrade(){
  const s=this.state,castle=s.buildings.find(b=>b.kind==="castle");if(!castle||dist(castle.x,s.player.x)>190||s.castleLevel>=3)return;
  const costs=s.castleLevel===1?{wood:120,stone:90,iron:20}:{wood:220,stone:160,iron:45};
  if(!Object.entries(costs).every(([k,v])=>(s.resources as any)[k]>=v))return;for(const [k,v] of Object.entries(costs))(s.resources as any)[k]-=v;
  s.castleLevel++;castle.level=s.castleLevel;castle.maxHp+=450;castle.hp=castle.maxHp;
 }
 closestEnemy(x:number){return this.state.enemies.reduce((b,e)=>!b||dist(e.x,x)<dist(b.x,x)?e:b,undefined as any)}
 arrow(x:number,y:number,target:number){const dx=target-x;this.state.projectiles.push({id:"p"+Date.now()+Math.random(),x,y,vx:Math.sign(dx)*Math.min(430,210+dist(target,x)*.3),vy:-190,damage:18,kind:"arrow",life:2.4})}
 cleanup(){
  const s=this.state;if(s.player.health<=0){s.player.health=100;s.player.x=0;s.resources.coins=Math.max(0,s.resources.coins-10)}
  for(let i=s.enemies.length-1;i>=0;i--)if(s.enemies[i].hp<=0){s.resources.coins+=2;s.resources.meat++;s.enemies.splice(i,1)}
  for(let i=s.buildings.length-1;i>=0;i--)if(s.buildings[i].hp<=0&&s.buildings[i].id!=="keep")s.buildings.splice(i,1);
 }
}
function tweakState(s:GameState){if(!s.player){return}s.player.y??=0;s.player.vx??=0;s.player.vy??=0;s.player.animTime??=0;s.player.onGround??=true;for(const u of s.units){u.y??=0;u.vx??=0;u.animTime??=0}for(const a of s.animals){a.y??=0;a.vx??=0;a.animTime??=0;a.hunger??=0}for(const c of s.crops){c.health??=100;c.windPhase??=0}}
