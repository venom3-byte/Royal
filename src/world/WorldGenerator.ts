import {GameState} from "../core/Types";
export class WorldGenerator{
 static make(seed=1337):GameState{
  const buildings=[
   {id:"keep",kind:"castle",x:0,level:1,hp:800,maxHp:800},
   {id:"farm1",kind:"farm",x:250,level:1,hp:180,maxHp:180},
   {id:"gateL",kind:"gate",x:-360,level:1,hp:350,maxHp:350},
   {id:"gateR",kind:"gate",x:360,level:1,hp:350,maxHp:350},
   {id:"yard",kind:"training",x:110,level:1,hp:220,maxHp:220}
  ];
  const crops=[];for(let i=0;i<9;i++)crops.push({id:"c"+i,x:230+(i%3)*54,y:0,stage:i%2,age:i*9,kind:"wheat" as const,water:0});
  const animals=[];for(let i=0;i<7;i++)animals.push({id:"a"+i,kind:(i<3?"sheep":i<5?"cow":"deer") as any,x:(i-3)*95,y:0,age:30+i*12,state:"graze",wild:i>=5});
  const units=[{id:"u1",role:"farmer" as const,x:90,y:0,hp:70,rank:1,state:"work",homeX:90},{id:"u2",role:"builder" as const,x:150,y:0,hp:80,rank:1,state:"work",homeX:150}];
  return {version:1,worldSeed:seed,time:0,seasonIndex:0,weather:"clear",resources:{coins:40,wood:80,stone:40,iron:10,food:30,meat:0,milk:0,fur:0},player:{x:0,y:0,health:100,stamina:100,facing:1,weapon:"sword"},buildings, crops, animals, units, enemies:[], flags:[-360,360], day:1};
 }
}