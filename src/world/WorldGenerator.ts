import {GameState} from "../core/Types";
export class WorldGenerator{
 static make(seed=1337):GameState{
  const buildings:any=[
   {id:"keep",kind:"castle",x:0,level:1,hp:800,maxHp:800},
   {id:"farm1",kind:"farm",x:205,level:1,hp:160,maxHp:160},
   {id:"gateL",kind:"gate",x:-420,level:1,hp:360,maxHp:360},
   {id:"gateR",kind:"gate",x:420,level:1,hp:360,maxHp:360},
   {id:"yard",kind:"training",x:105,level:1,hp:250,maxHp:250},
   {id:"barn",kind:"barn",x:335,level:1,hp:240,maxHp:240},
   {id:"smith",kind:"blacksmith",x:-155,level:1,hp:260,maxHp:260},
   {id:"towerL",kind:"tower",x:-390,level:1,hp:260,maxHp:260}
  ];
  const crops:any=[];for(let i=0;i<16;i++)crops.push({id:"c"+i,x:155+(i%8)*27,stage:(i%4) as 0|1|2|3,age:i*110,kind:i%9===0?"winter":"wheat",water:45,health:100,windPhase:i*.73});
  const animals:any=[];
  for(let i=0;i<9;i++)animals.push({id:"a"+i,kind:i<4?"sheep":i<7?"cow":i===7?"bull":"horse",x:275+(i%3)*48,y:0,vx:0,age:20+i*9,state:"graze",wild:false,animTime:i, hunger:15});
  for(let i=0;i<8;i++){const kind=i%4===0?"rabbit":i%3===0?"wolf":"deer";animals.push({id:"w"+i,kind,x:-850-i*115,y:0,vx:0,age:30+i*13,state:"graze",wild:true,animTime:i,hunger:0})}
  const units:any=[
   {id:"u1",role:"farmer",rank:1,x:120,y:0,vx:0,hp:70,maxHp:70,state:"work",homeX:150,animTime:0},
   {id:"u2",role:"builder",rank:1,x:40,y:0,vx:0,hp:80,maxHp:80,state:"work",homeX:60,animTime:1},
   {id:"u3",role:"villager",rank:1,x:-140,y:0,vx:0,hp:70,maxHp:70,state:"idle",homeX:-140,animTime:2},
   {id:"u4",role:"farmer",rank:1,x:175,y:0,vx:0,hp:70,maxHp:70,state:"work",homeX:185,animTime:3}
  ];
  return{version:3,worldSeed:seed,time:0,seasonIndex:0,weather:"clear",day:1,resources:{coins:45,wood:120,stone:70,iron:18,food:45,meat:0,milk:0,fur:0,oil:20},player:{x:-90,y:0,vx:0,vy:0,health:100,stamina:100,facing:1,weapon:"sword",attackTimer:0,animTime:0,onGround:true},buildings,crops,animals,units,enemies:[],projectiles:[],flags:[-420,420],selectedBuild:"wall",wave:0,castleLevel:1};
 }
}