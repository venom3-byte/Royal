import {createState,hydrateState,saveState,loadState} from "./src/state.js";
import {DAY_LENGTH,SEASON_LENGTH,SEASONS,WEATHER,BUILDINGS,SHELLS,ROYAL_FORMATIONS,QUALITY} from "./src/config.js";
import {tick,build,upgradeCastle,recruit,addRoyalGuard,setGuardOrder,setRoyalFormation,fireCannon,cycleShell,boardWagon,interact,notify,currentPhase,seasonData} from "./src/systems.js";
import {createRenderer} from "./src/renderer.js";
import {SoundSystem} from "./src/audio.js";
import {setupInput} from "./src/input.js";

const canvas=document.getElementById("world");
const state=hydrateState(loadState());
const audio=new SoundSystem();
const assets=window.RSK_ASSETS||{};
const renderer=createRenderer(canvas,assets);
const ui={
 start:document.getElementById("start"),startBtn:document.getElementById("startBtn"),
 modal:document.getElementById("modal"),menu:document.getElementById("menu"),close:document.getElementById("closeMenu"),
 radial:document.getElementById("radial"),notice:document.getElementById("objective"),stats:document.getElementById("stats"),
 interact:document.getElementById("interact"),shell:document.getElementById("shellPicker"),quality:document.getElementById("quality"),
 save:document.getElementById("save"),load:document.getElementById("load"),reset:document.getElementById("reset"),
 timeFill:document.getElementById("timeFill"),timeLabel:document.getElementById("timeLabel"),weather:document.getElementById("weather"),
 season:document.getElementById("season"),gold:document.getElementById("gold"),wood:document.getElementById("wood"),food:document.getElementById("food"),stone:document.getElementById("stone"),population:document.getElementById("population")
};
let last=performance.now();

function sync(){
 const q=state.time%DAY_LENGTH,m=Math.floor(q/60),s=Math.floor(q%60),ph=currentPhase(state);
 ui.gold.textContent=Math.floor(state.resources.gold);ui.wood.textContent=Math.floor(state.resources.wood);ui.food.textContent=Math.floor(state.resources.food);ui.stone.textContent=Math.floor(state.resources.stone);
 ui.population.textContent=state.population.used+"/"+state.population.cap;ui.season.textContent=SEASONS[state.seasonIndex].name;
 ui.timeFill.style.width=((q/DAY_LENGTH)*100)+"%";ui.timeLabel.textContent=ph.name+" · "+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");ui.weather.textContent=WEATHER[state.weather].name;ui.notice.textContent=state.notice;
 ui.interact.textContent=state.wagon.active?"⚔️":"✦";ui.shell?.classList.toggle("visible",nearCannon());
 ui.shell&&(ui.shell.textContent=SHELLS[state.shell].name);
}
function nearCannon(){return state.buildings.some(b=>b.type==="cannon"&&Math.abs(b.x-state.player.x)<170)}
function openMenu(){
 state.paused=true;ui.modal.classList.remove("hidden");
 const royal=state.units.filter(u=>u.type==="royalGuard").length,guards=state.units.filter(u=>u.type==="guard").length;
 ui.stats.innerHTML=
 `<div>اليوم <b>${state.day}</b></div><div>الفصل <b>${SEASONS[state.seasonIndex].name}</b></div><div>القلعة <b>${Math.floor(state.castle.hp)}/${state.castle.maxHp}</b></div><div>الحرس <b>${guards}</b></div><div>الحرس الملكي <b>${royal}</b></div><div>الأعداء <b>${state.enemies.length}</b></div><div>القتل <b>${state.stats.kills}</b></div><div>النتيجة <b>${state.score}</b></div>`;
}
function closeMenu(){state.paused=false;ui.modal.classList.add("hidden")}
function openRadial(unit,x,y){
 if(!ui.radial)return;ui.radial.classList.remove("hidden");ui.radial.style.left=Math.max(80,Math.min(innerWidth-80,x))+"px";ui.radial.style.top=Math.max(120,Math.min(innerHeight-120,y))+"px";ui.radial.dataset.unit=unit.id;
}
function closeRadial(){ui.radial?.classList.add("hidden")}
function pickUnit(clientX,clientY){
 const rect=canvas.getBoundingClientRect(),sx=clientX-rect.left,sy=clientY-rect.top,gy=renderer.size.H*.72;
 let best=null,bd=60;
 for(const u of state.units){const x=(u.x-state.camera.x)*state.camera.zoom+renderer.size.W/2,d=Math.hypot(x-sx,(gy-34)-sy);if(d<bd){bd=d;best=u}}
 return best;
}
function contextTap(){
 audio.init();audio.resume();interact(state,audio);closeRadial();sync();
}
function start(){
 audio.init();audio.resume();state.running=true;ui.start.style.display="none";notify(state,"الحملة بدأت. استغل النهار قبل موجة الليل.","dawn");sync();
}
ui.startBtn.onclick=start;ui.menu.onclick=openMenu;ui.close.onclick=closeMenu;
ui.save.onclick=()=>{saveState(state);notify(state,"تم حفظ الحملة في الهاتف.","coin");sync()};
ui.load.onclick=()=>{const s=loadState();if(s){Object.assign(state,hydrateState(s));notify(state,"تم تحميل آخر حفظ.","coin")}else notify(state,"لا يوجد حفظ سابق.");sync()};
ui.reset.onclick=()=>{localStorage.removeItem("rsk_kingdom_save");location.reload()};
document.querySelectorAll("[data-build]").forEach(b=>b.onclick=()=>{build(state,b.dataset.build,audio);sync()});
document.getElementById("upgradeCastle").onclick=()=>{upgradeCastle(state,audio);sync()};
document.getElementById("recruitGuard").onclick=()=>{recruit(state,"guard",audio);sync()};
document.getElementById("recruitHunter").onclick=()=>{recruit(state,"hunter",audio);sync()};
document.getElementById("royalGuard").onclick=()=>{addRoyalGuard(state,audio);sync()};
document.getElementById("wagon").onclick=()=>{boardWagon(state);sync()};
document.getElementById("cannonShell").onclick=()=>{cycleShell(state);sync()};
document.getElementById("cannonFire").onclick=()=>{fireCannon(state,audio);sync()};
document.getElementById("formationCircle").onclick=()=>{setRoyalFormation(state,"circle");sync()};
document.getElementById("formationVanguard").onclick=()=>{setRoyalFormation(state,"vanguard");sync()};
document.getElementById("formationSpread").onclick=()=>{setRoyalFormation(state,"spread");sync()};
ui.shell.onclick=()=>{cycleShell(state);sync()};
ui.quality.onclick=()=>{const list=["auto","high","medium","low"];state.quality=list[(list.indexOf(state.quality)+1)%list.length];ui.quality.textContent="⚙ الجودة: "+({auto:"تلقائي",high:"عالية",medium:"متوسطة",low:"اقتصادية"}[state.quality])};
document.querySelectorAll("[data-order]").forEach(b=>b.onclick=()=>{setGuardOrder(state,b.dataset.order,state.player.x);sync()});
ui.radial?.querySelectorAll("[data-radial]").forEach(b=>b.onclick=()=>{const cmd=b.dataset.radial;if(cmd==="defend"||cmd==="attack"||cmd==="escort"||cmd==="return")setGuardOrder(state,cmd,state.player.x);else if(cmd==="royal")addRoyalGuard(state,audio);closeRadial();sync()});

setupInput(canvas,state,{audio,interact:()=>{interact(state,audio);sync()},contextTap,pickUnit,openRadial});
function frame(now){
 const dt=Math.min(.045,(now-last)/1000);last=now;
 tick(state,dt,audio);renderer.render(state);sync();
 requestAnimationFrame(frame);
}
sync();requestAnimationFrame(frame);
