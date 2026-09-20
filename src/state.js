import {BUILDINGS,LIVESTOCK} from "./config.js";
let nextId=1;
export const uid=()=>nextId++;
export function makeBuilding(type,x,extra={}){const d=BUILDINGS[type]||{};return {id:uid(),type,x,y:0,level:1,maxHp:d.hp||100,hp:d.hp||100,active:true,anim:"idle",...extra}}
export function makeUnit(type,x,extra={}){
 const base={id:uid(),type,x,y:0,vx:0,hp:20,maxHp:20,state:"idle",rank:1,weapon:"sword",order:"patrol",orderTarget:null,formationIndex:0,trainedAt:0,work:"none",group:0,energy:100,attackCooldown:0,anim:"idle",facing:1};
 if(type==="worker"||type==="farmer")Object.assign(base,{hp:22,maxHp:22,state:"work"});
 if(type==="guard")Object.assign(base,{hp:34,maxHp:34,weapon:"sword"});
 if(type==="hunter")Object.assign(base,{hp:28,maxHp:28,weapon:"bow"});
 if(type==="royalGuard")Object.assign(base,{hp:48,maxHp:48,rank:5,weapon:"sword",order:"royal"});
 return Object.assign(base,extra);
}
export function makeAnimal(type,x,extra={}){return {id:uid(),type,x,y:0,vx:0,health:100,age:.1,gender:Math.random()<.5?"F":"M",stress:0,hunger:0,wool:type==="sheep"?100:0,milkCooldown:0,birthCooldown:0,state:"graze",anim:"idle",facing:1,...extra}}
export function makeCrop(type,x){return {id:uid(),type,x,progress:0,stage:0,watered:0,ready:false,glow:0}}
export function makeEnemy(kind,x,day){const brute=kind==="brute";const hp=(brute?32:16)+Math.floor(day*.8);return {id:uid(),type:kind,x,y:0,hp,maxHp:hp,speed:(brute?16:26)+day*.55,attackCooldown:0,stagger:0,anim:"walk",facing:1}}
export function createState(){
 return {version:4,running:false,paused:false,gameOver:false,time:0,day:1,seasonIndex:0,weather:"clear",weatherNext:95,seasonGrowth:1,weatherGrowth:1,
  camera:{x:0,zoom:1,targetZoom:1,shake:0},player:{x:0,y:0,vx:0,speed:0,speedMultiplier:1,wagonSpeed:120,mode:"foot",facing:1,moveIntent:0,moving:0,formation:"circle",action:null,actionCooldown:0,anim:"idle"},
  resources:{gold:180,wood:120,food:90,stone:55,iron:12,oil:3,leather:0,wool:0,bones:0,milk:0},population:{used:5,cap:14},
  castle:{hp:260,maxHp:260,level:1},score:0,reputation:0,shell:"iron",quality:"auto",buildings:[makeBuilding("castle",0,{level:1})],
  units:[makeUnit("worker",-125,{work:"wood"}),makeUnit("worker",-55,{work:"farm"}),makeUnit("farmer",35,{work:"farm"}),makeUnit("guard",105,{trainedAt:0}),makeUnit("hunter",175)],
  animals:[makeAnimal("cow",-230,{gender:"F"}),makeAnimal("cow",-185,{gender:"F"}),makeAnimal("bull",-140,{gender:"M"}),makeAnimal("sheep",-95,{gender:"F"}),makeAnimal("sheep",-50,{gender:"M"})],
  crops:[makeCrop("wheat",-70),makeCrop("wheat",-35),makeCrop("wheat",0)],enemies:[],projectiles:[],particles:[],fires:[],ropes:[],leaves:[],
  wagon:{unlocked:false,x:0,active:false,wheelAngle:0,mode:"waiting"},cannonAim:.52,cannonPower:.68,notice:"ابنِ اقتصادك، درّب الحرس، واحمِ القلعة.",
  stats:{kills:0,harvests:0,animalsProcessed:0,hunts:0,cannonShots:0,daysSurvived:0}};
}
export function hydrateState(saved){const base=createState();if(!saved)return base;const merged=structuredClone(base);const copy={...merged,...saved,player:{...merged.player,...(saved.player||{})},camera:{...merged.camera,...(saved.camera||{})},resources:{...merged.resources,...(saved.resources||{})},population:{...merged.population,...(saved.population||{})},castle:{...merged.castle,...(saved.castle||{})},wagon:{...merged.wagon,...(saved.wagon||{})},stats:{...merged.stats,...(saved.stats||{})}};copy.version=4;nextId=1;for(const e of [...copy.buildings,...copy.units,...copy.animals,...copy.crops,...copy.enemies])nextId=Math.max(nextId,(e.id||0)+1);return copy}
export function buildUnlock(state,type){if(["well","stable","forge","slaughterhouse","quarantine"].includes(type))return state.castle.level>=2;if(type==="cannon")return state.castle.level>=3;return true}
export function resetIds(){nextId=1}
export {LIVESTOCK,BUILDINGS};