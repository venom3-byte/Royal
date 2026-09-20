import {GameState,BuildKind,BUILD_COSTS,EnemyState,ProjectileState} from "../core/Types";
import {TimeManager} from "../core/TimeManager";

function costCanPay(s:GameState,c:Partial<GameState["resources"]>){return Object.entries(c).every(([k,v])=>(s.resources as any)[k]>=(v||0))}
function pay(s:GameState,c:Partial<GameState["resources"]>){for(const [k,v] of Object.entries(c))if(v)(s.resources as any)[k]-=v}

export class WorldSimulation{
 moveX=0;attack=false;coin=false;build=false;interact=false;
 private spawnTimer=0;private autosaveTimer=0;private dayFoodTimer=0;
 constructor(public state:GameState,public time:TimeManager){}
 update(dt:number){
  const s=this.state,t=this.time;
  t.update(dt);s.time=t.elapsed;s.day=t.day;s.seasonIndex=["spring","summer","autumn","winter"].indexOf(t.season);s.weather=t.weather;
  this.updatePlayer(dt);this.updateUnits(dt);this.updateCrops(dt);this.updateAnimals(dt);this.updateEconomy(dt);this.updateNight(dt);this.updateProjectiles(dt);
  if(this.attack)this.playerAttack();
  if(this.coin){this.coin=false;this.recruitNearest();}
  if(this.build){this.build=false;this.placeSelectedBuild();}
  this.autosaveTimer+=dt;
 }
 private updatePlayer(dt:number){const s=this.state;const speed=s.player.stamina<10?70:135;const weatherSpeed=this.time.season==="winter"?.9:this.time.weather==="heat"?.92:1;s.player.x+=this.moveX*speed*weatherSpeed*dt;s.player.x=Math.max(-2200,Math.min(2200,s.player.x));if(this.moveX)s.player.facing=this.moveX>0?1:-1;s.player.stamina=Math.max(0,Math.min(100,s.player.stamina+(Math.abs(this.moveX)<.1?20:-13)*dt));s.player.attackTimer=Math.max(0,s.player.attackTimer-dt)}
 private updateUnits(dt:number){const s=this.state;for(const u of s.units){if(u.role==="farmer"){const target=nearest(s.crops,u.x);if(target&&target.stage<3){u.state="work";u.x+=Math.sign(target.x-u.x)*18*dt;target.water=Math.min(100,target.water+dt*7)}else u.x+=Math.sin(s.time*.4+u.x)*dt*4}else if(u.role==="builder"){u.state="work";u.x+=Math.sin(s.time*.35+u.homeX)*dt*3}else if(u.role==="guard"||u.role==="archer"){const enemy=nearestEnemy(s.enemies,u.x);if(enemy&&Math.abs(enemy.x-u.x)<300){u.state="fight";u.targetId=enemy.id;if(u.role==="archer"){u.x+=Math.sign(enemy.x-u.x)*10*dt; if(Math.random()<dt*.8)spawnArrow(s,u.x,u.y||0,enemy.x-(u.x),enemy.y)}}else{u.state="patrol";u.x+=Math.sin(s.time*.45+u.homeX)*dt*12}}}}
 private updateCrops(dt:number){const s=this.state;for(const c of s.crops){let rate=this.time.season==="spring"?1.15:this.time.season==="autumn"?.8:1;if(this.time.season==="winter"&&c.kind!=="winter")rate=0;if(this.time.weather==="rain")rate*=1.15;c.age+=dt*rate;if(c.stage<3&&c.age>(35+c.stage*25))c.stage=(c.stage+1) as any;if(c.stage===3&&Math.random()<dt*.025)s.resources.food=Math.min(999,s.resources.food+1)}}
 private updateAnimals(dt:number){const s=this.state;for(const a of s.animals){a.age+=dt;if(a.wild){if(this.time.phase==="night"){a.state="flee";a.x+=Math.sin(s.time*.8+a.age)*dt*26}else{a.state="graze";a.x+=Math.sin(s.time*.2+a.age)*dt*5}}else a.x+=Math.sin(s.time*.18+a.age)*dt*2;if(a.x<-2200)a.x=-2100;if(a.x>2200)a.x=2100}}
 private updateEconomy(dt:number){this.dayFoodTimer+=dt;if(this.dayFoodTimer>20){this.dayFoodTimer=0;const workers=this.state.units.length;this.state.resources.food=Math.max(0,this.state.resources.food-workers)}}
 private updateNight(dt:number){const s=this.state;if(this.time.phase!=="night"){this.spawnTimer=0;return}this.spawnTimer+=dt;if(this.spawnTimer>=10){this.spawnTimer=0;const side=Math.random()<.5?-1:1;const strength=1+(s.day-1)*.16+(s.seasonIndex===3?.25:0);const brute=Math.random()<Math.min(.35,.08+s.day*.01);const hp=Math.round((brute?105:48)*strength);const e:EnemyState={id:"e"+Date.now()+Math.random(),x:s.player.x+side*(520+Math.random()*220),hp,maxHp:hp,speed:(brute?18:29)*strength,damage:brute?10:4,kind:brute?"brute":Math.random()<.25?"scout":"greedling"};s.enemies.push(e);s.wave=Math.max(s.wave,Math.floor(s.day/2)+1)}} 
 private updateProjectiles(dt:number){const s=this.state;for(let i=s.projectiles.length-1;i>=0;i--){const p=s.projectiles[i];p.life-=dt;p.vy+=420*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;let hit=false;for(const e of s.enemies)if(Math.abs(e.x-p.x)<28&&Math.abs((e.y||0)-p.y)<45){e.hp-=p.damage;hit=true;break}if(p.life<=0||p.y>150||hit)s.projectiles.splice(i,1)}for(const e of s.enemies){const target=s.player.x;const dir=Math.sign(target-e.x);e.x+=dir*e.speed*dt;for(const b of s.buildings)if((b.kind==="wall"||b.kind==="gate"||b.kind==="tower")&&Math.abs(b.x-e.x)<34){b.hp-=e.damage*dt;e.x-=dir*e.speed*dt}}this.cleanupEnemies()}
 private cleanupEnemies(){const s=this.state;for(let i=s.enemies.length-1;i>=0;i--){if(s.enemies[i].hp>0)continue;s.resources.coins+=2;s.resources.meat+=1;s.enemies.splice(i,1)}}
 private playerAttack(){const s=this.state;if(s.player.attackTimer>0)return;s.player.attackTimer=.55;const range=s.player.weapon==="spear"?112:s.player.weapon==="axe"?92:78;const dmg=s.player.weapon==="axe"?38:s.player.weapon==="spear"?28:22;for(const e of s.enemies)if(Math.abs(e.x-s.player.x)<range)e.hp-=dmg}
 private recruitNearest(){const s=this.state;if(s.resources.coins<1)return;const v=s.units.find(u=>u.role==="villager"&&Math.abs(u.x-s.player.x)<280);if(v){s.resources.coins--;v.role="farmer";v.state="work";s.resources.wood+=1;return}const newcomer={id:"u"+Date.now()+Math.random(),role:"villager" as const,rank:1,x:s.player.x+s.player.facing*70,hp:70,maxHp:70,state:"idle" as const,homeX:s.player.x+s.player.facing*70};if(s.resources.coins>=1){s.resources.coins--;s.units.push(newcomer)}}
 private placeSelectedBuild(){const s=this.state,k=s.selectedBuild,c=BUILD_COSTS[k];if(!costCanPay(s,c))return;pay(s,c);const x=Math.round((s.player.x+s.player.facing*110)/10)*10;const id="b"+Date.now();const hp={wall:180,tower:260,farm:160,barn:240,blacksmith:260,training:250,house:180,cannon:220}[k];s.buildings.push({id,kind:k,x,level:1,hp,maxHp:hp})}
}
function nearest<T extends {x:number}>(xs:T[],x:number){let best:T|undefined,bd=Infinity;for(const v of xs){const d=Math.abs(v.x-x);if(d<bd){bd=d;best=v}}return best}
function nearestEnemy(xs:EnemyState[],x:number){return nearest(xs,x)}
function spawnArrow(s:GameState,x:number,y:number,dx:number){const len=Math.max(1,Math.abs(dx));const p:ProjectileState={id:"p"+Date.now()+Math.random(),x,y:v(y),vx:Math.sign(dx)*Math.min(420,220+len*.35),vy:-150,damage:16,kind:"arrow",life:2.2};s.projectiles.push(p)}
function v(y:number){return y||-15}
