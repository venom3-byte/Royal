import {BUILDINGS,LIVESTOCK,WEAPONS,SHELLS,CROPS,SEASONS,QUALITY} from "./config.js";

let nextId=1;
export const uid=()=>nextId++;

export function makeBuilding(type,x,extra={}){
 const d=BUILDINGS[type];
 return {id:uid(),type,x,level:1,maxHp:d?.hp??100,hp:d?.hp??100,active:true,...extra};
}
export function makeUnit(type,x,extra={}){
 const base={
   id:uid(),type,x,y:0,hp:20,maxHp:20,state:"idle",rank:1,weapon:"sword",
   order:"patrol",orderTarget:null,formationOffset:0,trainedAt:0,work:"none",
   group:0,energy:100,fireCooldown:0,attackCooldown:0
 };
 if(type==="worker"||type==="farmer")Object.assign(base,{hp:22,maxHp:22,state:"work"});
 if(type==="guard")Object.assign(base,{hp:34,maxHp:34,weapon:"sword"});
 if(type==="hunter")Object.assign(base,{hp:28,maxHp:28,weapon:"bow"});
 if(type==="royalGuard")Object.assign(base,{hp:48,maxHp:48,rank:5,weapon:"sword",order:"royal"});
 return Object.assign(base,extra);
}
export function makeAnimal(type,x,extra={}){
 const d=LIVESTOCK[type]||LIVESTOCK.cow;
 return {id:uid(),type,x,y:0,health:100,age:.1,gender:Math.random()<.5?"F":"M",stress:0,hunger:0,wool:100,milkCooldown:0,birthCooldown:0,state:"graze",...extra};
}
export function makeCrop(type,x){
 return {id:uid(),type,x,progress:0,stage:0,watered:0,ready:false};
}
export function makeEnemy(kind,x,day){
 const brute=kind==="brute";
 const hp=(brute?32:16)+Math.floor(day*.8);
 return {id:uid(),type:kind,x,hp,maxHp:hp,speed:(brute?16:26)+day*.55,attackCooldown:0,stagger:0,target:null};
}

export function createState(){
 const state={
   version:3, running:false,paused:false,gameOver:false,
   time:0,day:1,seasonIndex:0,weather:"clear",weatherNext:95,
   camera:{x:0,zoom:1,targetZoom:1,shake:0},
   player:{x:0,mode:"foot",facing:1,moving:0,formation:"circle"},
   resources:{gold:180,wood:120,food:90,stone:55,iron:12,oil:3,leather:0,wool:0,bones:0,milk:0},
   population:{used:5,cap:14},
   castle:{hp:260,maxHp:260,level:1},
   score:0,reputation:0,
   shell:"iron",quality:"auto",
   buildings:[makeBuilding("castle",0,{level:1})],
   units:[
      makeUnit("worker",-125,{work:"wood"}),
      makeUnit("worker",-55,{work:"farm"}),
      makeUnit("farmer",35,{work:"farm"}),
      makeUnit("guard",105,{trainedAt:0}),
      makeUnit("hunter",175,{trainedAt:0})
   ],
   animals:[
      makeAnimal("cow",-230,{gender:"F"}),
      makeAnimal("cow",-185,{gender:"F"}),
      makeAnimal("bull",-140,{gender:"M"}),
      makeAnimal("sheep",-95,{gender:"F"}),
      makeAnimal("sheep",-50,{gender:"M"})
   ],
   crops:[
      makeCrop("wheat",-70),makeCrop("wheat",-35),makeCrop("wheat",0)
   ],
   enemies:[],projectiles:[],particles:[],fires:[],ropes:[],leaves:[],
   wagon:{unlocked:false,x:0,active:false,speed:120,wheelAngle:0,mode:"waiting"},
   cannonAim:0,cannonPower:0.68,
   notice:"ابنِ اقتصادك، درّب الحرس، واحمِ القلعة.",
   stats:{kills:0,harvests:0,animalsProcessed:0,hunts:0,cannonShots:0,daysSurvived:0}
 };
 return state;
}

function cleanForSave(state){
 return JSON.parse(JSON.stringify(state));
}
export function saveState(state){
 try{localStorage.setItem("rsk_kingdom_save",JSON.stringify(cleanForSave(state)));return true}catch{return false}
}
export function loadState(){
 try{const raw=localStorage.getItem("rsk_kingdom_save");if(!raw)return null;return JSON.parse(raw)}catch{return null}
}
export function hydrateState(saved){
 const base=createState(); if(!saved)return base;
 Object.assign(base,saved);
 nextId=1;
 const all=[...base.buildings,...base.units,...base.animals,...base.crops,...base.enemies];
 for(const e of all)nextId=Math.max(nextId,(e.id||0)+1);
 if(!base.resources)base.resources=createState().resources;
 if(!base.wagon)base.wagon=createState().wagon;
 if(!base.stats)base.stats=createState().stats;
 return base;
}

export function buildUnlock(state,type){
 if(type==="well")return state.castle.level>=2;
 if(type==="barracks")return state.castle.level>=1;
 if(type==="stable")return state.castle.level>=2;
 if(type==="forge")return state.castle.level>=2;
 if(type==="cannon")return state.castle.level>=3;
 if(type==="slaughterhouse")return state.castle.level>=2;
 if(type==="quarantine")return state.castle.level>=2;
 return true;
}
export function resourceCost(type){
 const d=BUILDINGS[type]; return d?{gold:d.gold,wood:d.wood,stone:d.stone}:null;
}
export {WEAPONS,SHELLS,CROPS,SEASONS,QUALITY};