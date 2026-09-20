import {UNIT_RANKS,WEAPONS} from "../config.js";
import {clamp,dist} from "../utils/math.js";
export function updateUnits(state,dt,api){
 const units=state.units, playerX=state.player.x, night=api.isNight();
 for(const u of units){
  if(u.hp<=0)continue;
  u.animation?.update(dt);
  if(u.attackCooldown>0)u.attackCooldown-=dt;
  const target=api.nearest(state.enemies,u.x);
  let speed=10;
  if(u.type==="worker"||u.type==="farmer"){u.state=night?"home":"work";const farm=api.nearest(state.buildings.filter(b=>b.type==="farm"||b.type==="well"),u.x);if(farm&&!night)u.vx=Math.sign(farm.x-u.x)*12;else u.vx=Math.sin(state.time+u.id)*3}
  else if(u.type==="hunter"){u.state=night?"home":"patrol";u.vx=night?0:Math.sin(state.time*.7+u.id)*12}
  else if(u.type==="guard"){speed=api.guardSpeed(u);if(u.order==="defend"||u.order==="escort")u.vx=Math.sign((u.orderTarget??playerX)-u.x)*22;else if(u.order==="attack"&&u.orderTarget!=null)u.vx=Math.sign(u.orderTarget-u.x)*34;else if(target&&dist(target,u.x)<320){u.state="combat";u.vx=Math.sign(target.x-u.x)*speed;if(dist(target,u.x)<(WEAPONS[u.weapon]?.range||58)&&u.attackCooldown<=0)api.attackUnit(u,target)}else u.vx=Math.sin(state.time+u.id)*8}
  else if(u.type==="royalGuard"){const list=units.filter(v=>v.type==="royalGuard"&&v.hp>0),idx=u.formationIndex??0;const radius=state.player.formation==="circle"?68:state.player.formation==="vanguard"?0:105;const targetX=state.player.formation==="circle"?playerX+Math.cos((idx/list.length)*Math.PI*2)*radius:playerX+(idx-(list.length-1)/2)*42;u.vx=Math.sign(targetX-u.x)*38;u.state="protect";if(target&&dist(target,playerX)<240&&dist(target,u.x)<95){u.vx=Math.sign(target.x-u.x)*58;if(dist(target,u.x)<66&&u.attackCooldown<=0)api.attackUnit(u,target)}}
  u.vx*=api.seasonMoveMultiplier();u.x+=u.vx*dt;u.facing=u.vx?Math.sign(u.vx):u.facing;u.anim=Math.abs(u.vx)>3?"walk":"idle";
  if(u.state==="combat"&&target)u.anim=u.attackCooldown<=0?"attack":"idle";
  u.x=clamp(u.x,playerX-900,playerX+900);
 }
}
export function guardSpeed(u){return u.type==="royalGuard"?58:22}
export function promoteUnits(state){for(const u of state.units){if(u.type!=="guard"||u.rank>=3||!u.trainedAt)continue; if(state.day-u.trainedAt>=1){u.rank=2;u.weapon="spear";u.maxHp=44;u.hp=u.maxHp} if(u.rank===2&&state.day-u.trainedAt>=3&&state.castle.level>=2){u.rank=3;u.weapon="sword";u.maxHp=60;u.hp=u.maxHp}}}
export function removeDeadUnits(state,notify){for(const u of state.units.filter(u=>u.hp<=0)){state.population.used=Math.max(0,state.population.used-1);notify(u.type==="royalGuard"?"سقط أحد الحرس الملكي.":"سقط أحد الحماة.");state.units.splice(state.units.indexOf(u),1)}}