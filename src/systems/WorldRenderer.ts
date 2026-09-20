import Phaser from "phaser";
import {GameState} from "../core/Types";
import {TimeManager} from "../core/TimeManager";

export class WorldRenderer{
 private objs=new Map<string,Phaser.GameObjects.Image|Phaser.GameObjects.Sprite>();
 private crops=new Map<string,Phaser.GameObjects.Image>();
 private projectiles=new Map<string,Phaser.GameObjects.Image>();
 private fx:Phaser.GameObjects.Graphics;
 private sky:Phaser.GameObjects.Graphics;
 private propLayer:Phaser.GameObjects.Container;
 private t=0;
 constructor(private scene:Phaser.Scene,private state:GameState,private time:TimeManager){
  scene.cameras.main.setViewport(0,0,720,800);
  scene.cameras.main.setBounds(-2500,0,5000,800);
  this.sky=scene.add.graphics().setScrollFactor(0).setDepth(-100);
  this.fx=scene.add.graphics().setScrollFactor(0).setDepth(120);
  this.propLayer=scene.add.container().setDepth(2);
  this.makeBackground();
  this.makeProps();
 }
 private makeBackground(){
  const g=this.sky;
  g.fillGradientStyle(0x8dc7df,0x8dc7df,0x324660,0x324660,1);g.fillRect(0,0,720,800);
  for(let i=0;i<5;i++){const m=this.scene.add.graphics().setScrollFactor(.05+i*.07).setDepth(-10+i);m.fillStyle(i<3?0x38556a-i*0x090909:0x2e4d45);for(let x=-3000;x<3000;x+=280){m.fillEllipse(x+i*71,470-i*45,330,140)}}
  const ground=this.scene.add.graphics().setScrollFactor(1).setDepth(0);ground.fillStyle(0x2d4b2d);ground.fillRect(-2600,520,5200,280);ground.fillStyle(0x3c6038);ground.fillRect(-2600,520,5200,16);
 }
 private makeProps(){
  let seed=this.state.worldSeed||1337;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=-25;i<=25;i++){if(Math.abs(i)<3)continue;const x=i*95+rand()*45-20;const key=rand()<.72?"tree":"rock";this.propLayer.add(this.scene.add.image(x,520,key).setOrigin(.5,1).setDepth(2+Math.floor(rand()*4)))} 
 }
 render(){
  this.t+=1;const s=this.state;
  this.syncBuilding("keep",0,"castle"+Math.min(2,s.castleLevel),12);
  for(const b of s.buildings)this.syncBuilding(b.id,b.x,b.kind,10);
  for(const u of s.units)this.syncActor(u.id,u.x,u.role,u.rank,u.state==="fight");
  for(const a of s.animals)if(Math.abs(a.x-s.player.x)<720)this.syncActor(a.id,a.x,a.kind,1,a.state==="flee");
  for(const e of s.enemies)this.syncActor(e.id,e.x,e.kind,e.kind==="brute"?4:1,true);
  for(const c of s.crops)this.syncCrop(c.id,c.x,c.stage);
  for(const p of s.projectiles)this.syncProjectile(p.id,p.x,560-p.y,p.kind);
  const keep=new Set<string>(["keep",...s.buildings.map(b=>b.id),...s.units.map(u=>u.id),...s.animals.map(a=>a.id),...s.enemies.map(e=>e.id)]);
  for(const [id,o] of this.objs)if(!keep.has(id)){o.destroy();this.objs.delete(id)}
  for(const [id,o] of this.crops)if(!s.crops.some(c=>c.id===id)){o.destroy();this.crops.delete(id)}
  for(const [id,o] of this.projectiles)if(!s.projectiles.some(p=>p.id===id)){o.destroy();this.projectiles.delete(id)}
  let player=this.objs.get("player") as Phaser.GameObjects.Image|undefined;
  if(!player){player=this.scene.add.image(s.player.x,520,"king_0").setOrigin(.5,1).setDepth(30);this.objs.set("player",player)}
  player.setPosition(s.player.x,520).setFlipX(s.player.facing<0);player.setTexture("king_"+(Math.floor(this.t/8)%4));
  this.scene.cameras.main.scrollX=Phaser.Math.Linear(this.scene.cameras.main.scrollX,s.player.x-320,.12);
  this.drawAtmosphere();
 }
 private syncBuilding(id:string,x:number,kind:string,depth:number){
  let o=this.objs.get(id);if(!o){const tex=kind==="castle1"||kind==="castle2"?kind:kind==="farm"?"farm":kind==="barn"?"barn":kind==="tower"?"tower":kind==="blacksmith"?"blacksmith":kind==="training"?"training":kind==="cannon"?"cannon":kind==="wall"?"wall":"farm";o=this.scene.add.image(x,520,tex).setOrigin(.5,1).setDepth(depth);this.objs.set(id,o)}o.setPosition(x,520)
 }
 private syncActor(id:string,x:number,kind:string,rank:number,flip:boolean){
  let key=kind==="guard"?"guard":kind==="archer"?"archer":kind==="farmer"?"farmer":kind==="villager"?"villager":kind==="king"?"king":kind==="cow"?"cow":kind==="sheep"?"sheep":kind==="horse"?"horse":kind==="deer"?"deer":kind==="brute"?"brute":"enemy";
  let o=this.objs.get(id) as Phaser.GameObjects.Image|undefined;if(!o){o=this.scene.add.image(x,520,key+"_0" in this.scene.textures.list?key+"_0":key).setOrigin(.5,1).setDepth(20);this.objs.set(id,o)}
  const animated=["guard","archer","farmer","villager"].includes(key)||["king"].includes(key);if(animated)o.setTexture(key+"_"+(Math.floor(this.t/9)%4));else o.setTexture(key);
  o.setX(x).setY(520).setFlipX(flip);
 }
 private syncCrop(id:string,x:number,stage:number){let o=this.crops.get(id);const tex="crop"+stage;if(!o){o=this.scene.add.image(x,520,tex).setOrigin(.5,1).setDepth(5);this.crops.set(id,o)}o.setTexture(tex).setX(x).setY(520)}
 private syncProjectile(id:string,x:number,y:number,kind:string){let o=this.projectiles.get(id);if(!o){o=this.scene.add.image(x,y,kind==="cannon"?"rock":"coin").setOrigin(.5).setDepth(25);this.projectiles.set(id,o)}o.setPosition(x,y)}
 private drawAtmosphere(){
  const g=this.fx;g.clear();const p=this.time.phase;const alpha=p==="night"?.55:p==="dusk"?.23:p==="dawn"?.1:0;g.fillStyle(0x11152b,alpha);g.fillRect(-20,0,760,800);
  const t=this.time.cycleTime;const sx=(t/300)*760-20;g.fillStyle(p==="night"?0xe7e5cb:0xf5ca65,1);g.fillCircle(sx,110,p==="night"?22:28);
  if(this.time.weather==="rain"){g.lineStyle(2,0xb7d4e8,.5);for(let i=0;i<80;i++){const x=(i*73+this.t*11)%760;const y=(i*47+this.t*19)%770;g.lineBetween(x,y,x-8,y+24)}} 
  if(this.time.weather==="snow"){g.fillStyle(0xf2f5ff,.75);for(let i=0;i<65;i++){const x=(i*61+this.t*3)%760;const y=(i*83+this.t*8)%780;g.fillCircle(x,y,2)}} 
  if(this.time.weather==="fog"){g.fillStyle(0xdce5e4,.12);g.fillRect(0,350,720,240)}
 }
}
