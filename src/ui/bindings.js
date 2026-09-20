import {clearGame,loadGame,saveGame} from "../save.js";import {hydrateState} from "../state.js";
import {build,upgradeCastle,recruit,addRoyalGuard,setGuardOrder,setRoyalFormation,fireCannon,cycleShell,boardWagon,interact,hunt} from "../systems.js";
export function bindGameUI(state,audio,hud,menu,openRadial,closeRadial){
 const $=id=>document.getElementById(id);
 const notify=(t,s)=>{state.notice=t;audio?.event(s||"click")};
 $("startBtn").onclick=()=>{state.running=true;$("start").style.display="none";notify("بدأت الحملة. استغل النهار قبل الليل.","dawn")};
 $("menu").onclick=()=>menu.open();$("closeMenu").onclick=()=>menu.close();
 $("save").onclick=()=>{saveGame(state);notify("تم حفظ الحملة في الهاتف.","coin");hud.sync(state)};
 $("load").onclick=()=>{const s=loadGame();if(s){Object.assign(state,hydrateState(s));notify("تم تحميل آخر حفظ.","coin")}else notify("لا يوجد حفظ سابق.");hud.sync(state);menu.refresh()};
 $("reset").onclick=()=>{clearGame();location.reload()};
 document.querySelectorAll("[data-build]").forEach(b=>b.onclick=()=>{build(state,b.dataset.build,notify);hud.sync(state)});
 $("upgradeCastle").onclick=()=>{upgradeCastle(state,notify);hud.sync(state)};
 $("recruitGuard").onclick=()=>{recruit(state,"guard",notify);hud.sync(state)};
 $("recruitHunter").onclick=()=>{recruit(state,"hunter",notify);hud.sync(state)};
 $("royalGuard").onclick=()=>{addRoyalGuard(state,notify);hud.sync(state)};
 $("wagon").onclick=()=>{boardWagon(state,notify);hud.sync(state)};
 $("hunt").onclick=()=>{hunt(state,notify);hud.sync(state)};
 $("interact").onclick=()=>{interact(state,{notify,effect:(x,t)=>audio?.event(t==="hit"?"hit":t==="cannon"?"cannon":"click")});hud.sync(state)};
 $("cannonShell").onclick=()=>{cycleShell(state);hud.sync(state)};$("shellPicker").onclick=()=>{cycleShell(state);hud.sync(state)};$("cannonFire").onclick=()=>{fireCannon(state,{notify,effect:(x,t)=>audio?.event(t==="cannon"?"cannon":"hit")});hud.sync(state)};
 $("quality").onclick=()=>{const q=["auto","high","medium","low"];state.quality=q[(q.indexOf(state.quality)+1)%q.length];hud.sync(state)};
 $("formationCircle").onclick=()=>{setRoyalFormation(state,"circle",notify);hud.sync(state)};$("formationVanguard").onclick=()=>{setRoyalFormation(state,"vanguard",notify);hud.sync(state)};$("formationSpread").onclick=()=>{setRoyalFormation(state,"spread",notify);hud.sync(state)};
 document.querySelectorAll("[data-order]").forEach(b=>b.onclick=()=>{setGuardOrder(state,b.dataset.order,state.player.x,notify);hud.sync(state)});
 document.querySelectorAll("[data-radial]").forEach(b=>b.onclick=()=>{const c=b.dataset.radial;if(c==="royal")addRoyalGuard(state,notify);else setGuardOrder(state,c,state.player.x,notify);closeRadial();hud.sync(state)});
 $("left").setAttribute("aria-label","تحرك يسار");$("right").setAttribute("aria-label","تحرك يمين");
 return {notify};
}
