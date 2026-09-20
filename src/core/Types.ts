export type Season="spring"|"summer"|"autumn"|"winter";
export type Phase="dawn"|"day"|"dusk"|"night";
export type Weather="clear"|"rain"|"fog"|"wind"|"snow"|"heat";
export type Weapon="sword"|"spear"|"bow"|"crossbow"|"axe";
export type UnitRole="villager"|"farmer"|"builder"|"guard"|"archer";
export type GuardRank="novice"|"trained"|"elite"|"gate"|"royal";
export type BuildKind="wall"|"tower"|"farm"|"barn"|"blacksmith"|"training"|"house"|"cannon";
export interface Resources{coins:number;wood:number;stone:number;iron:number;food:number;meat:number;milk:number;fur:number;oil:number}
export interface PlayerState{x:number;y:number;vx:number;vy:number;health:number;stamina:number;facing:1|-1;weapon:Weapon;attackTimer:number;animTime:number;onGround:boolean}
export interface BuildingState{id:string;kind:BuildKind|"castle"|"gate";x:number;level:number;hp:number;maxHp:number}
export interface CropState{id:string;x:number;stage:0|1|2|3;age:number;kind:"wheat"|"winter";water:number;health:number;windPhase:number}
export interface AnimalState{id:string;kind:"cow"|"sheep"|"bull"|"horse"|"deer"|"bison"|"wolf"|"rabbit";x:number;y:number;vx:number;age:number;state:"graze"|"flee"|"return"|"eat"|"rest";wild:boolean;animTime:number;hunger:number}
export interface UnitState{id:string;role:UnitRole;rank:1|2|3|4|5;x:number;y:number;vx:number;hp:number;maxHp:number;state:"idle"|"work"|"train"|"patrol"|"fight"|"escort";homeX:number;targetId?:string;animTime:number;taskX?:number}
export interface EnemyState{id:string;x:number;hp:number;maxHp:number;speed:number;damage:number;kind:"greedling"|"brute"|"scout"}
export interface ProjectileState{id:string;x:number;y:number;vx:number;vy:number;damage:number;kind:"arrow"|"bolt"|"cannon";life:number}
export interface GameState{version:number;worldSeed:number;time:number;seasonIndex:number;weather:Weather;day:number;resources:Resources;player:PlayerState;buildings:BuildingState[];crops:CropState[];animals:AnimalState[];units:UnitState[];enemies:EnemyState[];projectiles:ProjectileState[];flags:number[];selectedBuild:BuildKind;wave:number;castleLevel:number}
export const SEASONS:Season[]=["spring","summer","autumn","winter"];
export const BUILD_COSTS:Record<BuildKind,Partial<Resources>>={
  wall:{wood:18,stone:4},tower:{wood:35,stone:25},farm:{wood:30,stone:8},barn:{wood:55,stone:20},blacksmith:{wood:65,stone:40,iron:15},training:{wood:60,stone:25,iron:10},house:{wood:45,stone:8},cannon:{wood:80,stone:55,iron:25,oil:10}
};
