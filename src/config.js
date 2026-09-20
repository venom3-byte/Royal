export const TAU=Math.PI*2;
export const DAY_LENGTH=300;
export const SEASON_LENGTH=600;
export const MAX_PARTICLES=420;
export const MAX_VISIBLE_UNITS=40;

export const PHASES=[
  {id:"dawn",name:"الفجر",start:0,end:30},
  {id:"day",name:"النهار",start:30,end:180},
  {id:"dusk",name:"الغروب",start:180,end:210},
  {id:"night",name:"الليل",start:210,end:300}
];

export const SEASONS=[
 {id:"spring",name:"ربيع",growth:1.15,move:1,night:1,weather:["clear","rain","fog"]},
 {id:"summer",name:"صيف",growth:1,move:.98,night:1.05,weather:["clear","clear","heat","rain"]},
 {id:"autumn",name:"خريف",growth:.80,move:1,night:1.15,weather:["clear","wind","rain","fog"]},
 {id:"winter",name:"شتاء",growth:0,move:.90,night:1.30,weather:["snow","snow","clear","wind"]}
];

export const WEATHER={
 clear:{name:"صحو",growth:1,move:1,wind:0},
 rain:{name:"مطر",growth:1.15,move:.97,wind:.15},
 fog:{name:"ضباب",growth:1.02,move:.98,wind:0},
 wind:{name:"رياح",growth:.95,move:.99,wind:1},
 snow:{name:"ثلج",growth:.55,move:.90,wind:.20},
 heat:{name:"موجة حر",growth:.82,move:.92,wind:0}
};

export const BUILDINGS={
 castle:{name:"القلعة",gold:0,wood:0,stone:0,cap:0,hp:260},
 farm:{name:"مزرعة",gold:30,wood:10,stone:0,cap:0,hp:90},
 pasture:{name:"حظيرة مواشٍ",gold:35,wood:20,stone:0,cap:0,hp:100},
 house:{name:"مسكن",gold:35,wood:15,stone:0,cap:4,hp:90},
 wall:{name:"سور",gold:0,wood:25,stone:5,cap:0,hp:130},
 tower:{name:"برج رماية",gold:70,wood:15,stone:20,cap:0,hp:120},
 barracks:{name:"ثكنة",gold:90,wood:30,stone:20,cap:0,hp:150},
 stable:{name:"إسطبل",gold:80,wood:35,stone:10,cap:0,hp:120},
 forge:{name:"ورشة حداد",gold:110,wood:20,stone:35,cap:0,hp:130},
 cannon:{name:"مدفع",gold:150,wood:20,stone:30,cap:0,hp:120},
 slaughterhouse:{name:"مسلخ",gold:95,wood:30,stone:25,cap:0,hp:115},
 quarantine:{name:"حظيرة حجر صحي",gold:75,wood:35,stone:10,cap:0,hp:110},
 well:{name:"بئر وري",gold:65,wood:15,stone:35,cap:0,hp:100}
};

export const WEAPONS={
 sword:{name:"سيف",range:58,damage:8,rate:.65,knock:10},
 spear:{name:"رمح",range:84,damage:9,rate:.9,knock:26},
 axe:{name:"فأس حرب",range:62,damage:15,rate:1.35,knock:18},
 bow:{name:"قوس",range:280,damage:7,rate:1.4,projectile:"arrow"},
 crossbow:{name:"نشاب",range:230,damage:13,rate:2.1,projectile:"bolt"},
 matchlock:{name:"بندقية فتيل",range:330,damage:24,rate:3.4,projectile:"bullet"},
 ballista:{name:"Ballista",range:460,damage:34,rate:5.2,projectile:"bolt"}
};

export const SHELLS={
 iron:{name:"قذيفة حديدية",damage:45,radius:36,cost:{stone:2}},
 fire:{name:"برميل حارق",damage:20,radius:62,cost:{oil:1},burn:6},
 grape:{name:"خردق",damage:9,radius:88,cost:{iron:1},pellets:10},
 pierce:{name:"خارقة",damage:80,radius:14,cost:{stone:4}}
};

export const CROPS={
 wheat:{name:"قمح",stages:4,days:3,base:18,winter:false},
 barley:{name:"شعير",stages:4,days:2.5,base:14,winter:false},
 winterWheat:{name:"قمح شتوي",stages:4,days:3.5,base:16,winter:true}
};

export const LIVESTOCK={
 cow:{name:"بقرة",meat:12,skin:2,milk:3,food:1,size:1,gestation:1},
 sheep:{name:"خروف",meat:9,skin:1,wool:2,food:.7,size:.8,gestation:1},
 bull:{name:"ثور",meat:22,skin:3,food:1.5,size:1.35,gestation:1},
 horse:{name:"حصان",meat:0,skin:1,food:1,size:1.25,gestation:0}
};

export const UNIT_RANKS=[
 {id:1,name:"مبتدئ",mult:1,armor:"جلد",weapon:"sword"},
 {id:2,name:"مدرّب",mult:1.5,armor:"صفائح",weapon:"spear"},
 {id:3,name:"نخبة",mult:2,armor:"مصفّح",weapon:"sword"},
 {id:4,name:"حارس بوابة",mult:2,armor:"ثقيل",weapon:"spear"},
 {id:5,name:"حرس ملكي",mult:2.5,armor:"مذهّب",weapon:"sword"}
];

export const GUARD_COMMANDS=["defend","attack","escort","return"];
export const ROYAL_FORMATIONS=["circle","vanguard","spread"];
export const INTERACTIONS=["recruit","build","harvest","milk","shear","hunt","butcher","cannon","mount"];

export const QUALITY={
 auto:{particles:1,decor:1,aiDistance:1},
 high:{particles:1.3,decor:1.25,aiDistance:1},
 medium:{particles:.65,decor:.8,aiDistance:.8},
 low:{particles:.35,decor:.45,aiDistance:.55}
};