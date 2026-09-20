import {clamp} from "../utils/math.js";import {advanceAnimation} from "../core/animation.js";
export function updatePlayer(state,dt){
 const p=state.player;const intent=p.moveIntent||0;const maxSpeed=(p.mode==="wagon"?p.wagonSpeed:150)*(p.speedMultiplier||1);
 const accel=860,friction=1200;const desired=intent*maxSpeed;
 if(Math.abs(desired-p.vx)>0)p.vx+=Math.sign(desired-p.vx)*Math.min(Math.abs(desired-p.vx),accel*dt);
 if(!intent)p.vx+=Math.sign(-p.vx)*Math.min(Math.abs(p.vx),friction*dt);
 p.x+=p.vx*dt;p.facing=p.vx!==0?Math.sign(p.vx):p.facing;
 p.x=clamp(p.x,-12000,12000);
 p.speed=Math.abs(p.vx);p.anim=p.speed>8?"walk":"idle";
 if(p.actionCooldown>0)p.actionCooldown-=dt;advanceAnimation(p,dt);
}
export function requestPlayerAction(state,type="interact"){if(state.player.actionCooldown>0)return false;state.player.action=type;state.player.actionCooldown=.18;return true}
