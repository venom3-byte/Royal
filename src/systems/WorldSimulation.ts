import {GameState} from "../core/Types";
import {TimeManager} from "../core/TimeManager";
import {CombatSystem} from "./CombatSystem";
export class WorldSimulation{
 combat=new CombatSystem(); spawn=0; moveX=0;
 constructor(public state:GameState,public time:TimeManager){}
 update(dt:number){
  const s=this.state; this.time.update(dt);
  s.time=this.time.elapsed; s.day=this.time.day;
  s.seasonIndex=["spring","summer","autumn","winter"].indexOf(this.time.season);
  s.weather=this.time.weather;
  s.player.x+=this.moveX*120*dt*(this.time.season==="winter"?.9:1);
  if(this.moveX!==0)s.player.facing=Math.sign(this.moveX);
  s.player.stamina=Math.max(0,Math.min(100,s.player.stamina+(Math.abs(this.moveX)<.1?18:-12)*dt));
  for(const u of s.units)u.x+=Math.sin((s.time+u.id.length*10)*.4)*dt*8;
  for(const c of s.crops){let rate=this.time.season==="spring"?1.15:this.time.season==="autumn"?.8:1;if(this.time.season==="winter"&&c.kind!=="winter")rate=0;c.age+=dt*rate;if(c.age>45&&c.stage<3)c.stage++}
  this.spawn+=dt;
  if(this.time.phase==="night"&&this.spawn>12){this.spawn=0;const side=Math.random()<.5?-1:1;const hp=45+s.day*3;s.enemies.push({id:"e"+Date.now(),x:s.player.x+side*650,y:0,hp,maxHp:hp,speed:24+s.day*.8})}
  for(const e of s.enemies)e.x+=Math.sign(s.player.x-e.x)*e.speed*dt;
  this.combat.update(dt,s.player,s.units,s.enemies);
  for(let i=s.enemies.length-1;i>=0;i--)if(s.enemies[i].hp<=0){s.resources.coins+=2;s.enemies.splice(i,1)}
  if(s.player.health<=0){s.player.health=100;s.player.x=0;s.resources.coins=Math.max(0,s.resources.coins-10)}
 }
}