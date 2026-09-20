import {GameState} from "../core/Types";
export class WorldGenerator{
 static make(seed=1337):GameState{
  const buildings:any=[{id:"keep",kind:"castle",x:0,level:1,hp:800,maxHp:800},{id:"farm1",kind:"farm",x:250,level:1,hp:160,maxHp:160},{id:"gateL",kind:"gate",x:-360,level:1,hp:360,maxHp:360},{id:"gateR",kind:"gate",x:360,level:1,hp:360,maxHp:360},{id:"yard",kind:"training",x:115,level:1,hp:250,maxHp:250},{id:"barn",kind:"barn",x:340,level:1,hp:240,maxHp:240}];
  const crops:any=[];for(let i=0;i<12;i++)crops.push({id:"c"+i,x:185+(i%4)*38,stage:(i%3) as 0|1|2,age:i*12,kind:"wheat",water:10});
  const animals:any=[];for(let i=0;i<10;i++)animals.push({id:"a"+i,kind:i<4?"sheep":i<7?"cow":i===7?"horse":"deer",x:(i-5)*78,age:20+i*9,state:"graze",wild:i>=8});
  const units:any=[{id:"u1",role:"farmer",rank:1,x:90,hp:70,maxHp:70,state:"work",homeX:90},{id:"u2",role:"builder",rank:1,x:150,hp:80,maxHp:80,state:"work",homeX:150},{id:"u3",role:"villager",rank:1,x:-140,hp:70,maxHp:70,state:"idle",homeX:-140},{id:"u4",role:"farmer",rank:1,x:175,hp:70,maxHp:70,state:"work",homeX:175}];
  return{version:2,worldSeed:seed,time:0,seasonIndex:0,weather:"clear",day:1,resources:{coins:45,wood:120,stone:70,iron:18,food:45,meat:0,milk:0,fur:0,oil:20},player:{x:-90,health:100,stamina:100,facing:1,weapon:"sword",attackTimer:0},buildings,crops,animals,units,enemies:[],projectiles:[],flags:[-360,360],selectedBuild:"wall",wave:0,castleLevel:1};
 }
}