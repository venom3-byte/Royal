import {createState,hydrateState} from "./src/state.js";
import {loadGame} from "./src/save.js";
import {createRenderer} from "./src/renderer.js";
import {SoundSystem} from "./src/audio.js";
import {setupInput} from "./src/input.js";
import {tick,currentPhase,seasonData,attackUnit} from "./src/systems.js";
import {makeEnemy} from "./src/state.js";
import {createHUD} from "./src/ui/hud.js";
import {createMenu} from "./src/ui/menu.js";
import {bindGameUI} from "./src/ui/bindings.js";

const canvas=document.getElementById("world");
const state=hydrateState(loadGame());
const audio=new SoundSystem();
const renderer=createRenderer(canvas,window.RSK_ASSETS||{});
const hud=createHUD();
const ui={start:document.getElementById("start"),modal:document.getElementById("modal"),stats:document.getElementById("stats")};
const menu=createMenu(state,ui);
let radialUnit=null;
function openRadial(unit,x,y){radialUnit=unit;const el=document.getElementById("radial");el.classList.remove("hidden");el.style.left=Math.max(80,Math.min(innerWidth-80,x))+"px";el.style.top=Math.max(120,Math.min(innerHeight-120,y))+"px"}
function closeRadial(){document.getElementById("radial")?.classList.add("hidden");radialUnit=null}
function notify(text,sound){state.notice=text;if(sound)audio.event(sound)}
function effect(x,type){if(type==="hit")audio.event("hit");else if(type==="cannon")audio.event("cannon");else if(type==="death")audio.event("alert")}
function interact(){return import("./src/systems.js").then(m=>m.interact(state,{notify,effect}))}
const menuBinding=bindGameUI(state,audio,hud,menu,openRadial,closeRadial);
setupInput(canvas,state,{audio,notify,effect,contextTap:()=>{interact();closeRadial();hud.sync(state)},pickUnit:(x,y)=>pickUnit(x,y),openRadial});
function pickUnit(clientX,clientY){const rect=canvas.getBoundingClientRect(),sx=clientX-rect.left,sy=clientY-rect.top,gy=renderer.size.H*.72;let best=null,bd=62;for(const u of state.units){const px=(u.x-state.camera.x)*state.camera.zoom+renderer.size.W/2;const d=Math.hypot(px-sx,(gy-35)-sy);if(d<bd){bd=d;best=u}}return best}
function frame(now){const dt=Math.min(.05,(now-(frame.last||now))/1000);frame.last=now;tick(state,dt,{notify,effect,makeEnemy,attackUnit:(u,t)=>attackUnit(state,u,t,{effect}),enemyTarget:()=>null,damageTarget:()=>{}});renderer.render(state);hud.sync(state);requestAnimationFrame(frame)}
hud.sync(state);
requestAnimationFrame(frame);
