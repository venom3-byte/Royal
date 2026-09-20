import Phaser from "phaser";import {GameState} from "../core/Types";import {TimeManager} from "../core/TimeManager";
const W=720,H=930,G=650;
export class WorldRenderer{
 private objs=new Map<string,Phaser.GameObjects.Sprite|Phaser.GameObjects.Image>();private crops=new Map<string,Phaser.GameObjects.Image>();private projectiles=new Map<string,Phaser.GameObjects.Image>();private fx:Phaser.GameObjects.Graphics;private sky:Phaser.GameObjects.Graphics;private props:Phaser.GameObjects.Container;private pasture:Phaser.GameObjects.Graphics;private t=0;
 constructor(private scene:Phaser.Scene,private state:GameState,private time:TimeManager){
  scene.cameras.main.setBounds(-2500,0,5000,H);scene.cameras.main.scrollY=0;scene.cameras.main.setZoom(1);
  this.sky=scene.add.graphics().setScrollFactor(0).setDepth(-100);this.fx=scene.add.graphics().setScrollFactor(0).setDepth(120);this.props=scene.add.container().setDepth(2);this.pasture=scene.add.graphics().setDepth(5);
  this.background();this.makeProps();this.makePasture();
 }
 private background(){
  const g=this.sky;g.fillGradientStyle(0x9bd4e7,0x9bd4e7,0x45627b,0x45627b,1);g.fillRect(0,0,W,H);
  const far=this.scene.add.graphics().setScrollFactor(.08).setDepth(-20);far.fillStyle(0x6d8190);for(let x=-3000;x<3000;x+=330)far.fillTriangle(x,560,x+165,270+(x%90),x+330,560);
  const mid=this.scene.add.graphics().setScrollFactor(.18).setDepth(-10);mid.fillStyle(0x48695c);for(let x=-3000;x<3000;x+=250)mid.fillEllipse(x+100,545,360,170);
  const sea=this.scene.add.graphics().setScrollFactor(.06).setDepth(-15);sea.fillStyle(0x3e6f7d);sea.fillRect(1500,520,1100,130);for(let x=1500;x<2600;x+=90){sea.lineStyle(2,0x7ca7a9,.5);sea.lineBetween(x,545,x+55,545)}
  const ground=this.scene.add.graphics().setScrollFactor(1).setDepth(0);ground.fillStyle(0x2d4b2d);ground.fillRect(-2600,G,5200,280);ground.fillStyle(0x557a42);ground.fillRect(-2600,G,5200,13);
 }
 private makeProps(){
  let seed=this.state.worldSeed||1337;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=-28;i<=28;i++){if(Math.abs(i)<4)continue;const x=i*92+rand()*45-20;const key=rand()<.72?"tree":"rock";const o=this.scene.add.image(x,G,key).setOrigin(.5,1).setDepth(2+Math.floor(rand()*4));this.props.add(o)}
  for(let i=-28;i<=28;i++){const x=i*83+rand()*50;const grass=this.scene.add.graphics();grass.lineStyle(2,0x47763c,.9);grass.lineBetween(x,G,x-2,G-18);grass.lineBetween(x+4,G,x+8,G-14);grass.setDepth(3);this.props.add(grass)}
 }
 private makePasture(){
  const b=this.state.buildings.find(b=>b.kind==="barn");const cx=b?.x??335,lo=cx-125,hi=cx+125,g=this.pasture;
  g.lineStyle(7,0x6b472b,1);for(let x=lo;x<=hi;x+=34){g.lineBetween(x,590,x,690);g.lineBetween(x,590,x+12,590);g.lineBetween(x,615,x+12,615)}
  g.lineBetween(lo,590,hi,590);g.lineBetween(lo,615,hi,615);
  g.lineStyle(5,0x7a5030,1);g.lineBetween(lo,690,cx-38,690);g.lineBetween(cx+38,690,hi,690);for(let x=lo;x<=hi;x+=34)g.lineBetween(x,665,x,690);
  g.fillStyle(0x9a7744,.65);g.fillRect(cx-32,650,64,40);
 }
 render(){
  this.t++;const s=this.state;
  for(const b of s.buildings)this.syncBuilding(b.id,b.x,b.kind,b.level);
  for(const u of s.units)this.syncActor(u.id,u.x,u.role,u.rank,u.state,u.vx,u.animTime);
  for(const a of s.animals)if(Math.abs(a.x-s.player.x)<780)this.syncActor(a.id,a.x,a.kind,1,a.state==="flee",a.vx,a.animTime);
  for(const e of s.enemies)this.syncActor(e.id,e.x,e.kind,e.kind==="brute"?4:1,true,e.x-s.player.x, s.time);
  for(const c of s.crops)this.syncCrop(c.id,c.x,c.stage,c.windPhase);
  for(const p of s.projectiles)this.syncProjectile(p.id,p.x,G-18-p.y,p.kind,p.vx,p.vy);
  const live=new Set<string>(["keep",...s.buildings.map(b=>b.id),...s.units.map(u=>u.id),...s.animals.map(a=>a.id),...s.enemies.map(e=>e.id)]);
  for(const [id,o] of this.objs)if(!live.has(id)){o.destroy();this.objs.delete(id)}
  for(const [id,o] of this.crops)if(!s.crops.some(c=>c.id===id)){o.destroy();this.crops.delete(id)}
  for(const [id,o] of this.projectiles)if(!s.projectiles.some(p=>p.id===id)){o.destroy();this.projectiles.delete(id)}
  let p=this.objs.get("player") as Phaser.GameObjects.Image|undefined;
  if(!p){p=this.scene.add.image(s.player.x,G,"king_0").setOrigin(.5,1).setDepth(30);this.objs.set("player",p)}
  p.setPosition(s.player.x,G).setFlipX(s.player.facing<0).setTexture("king_"+this.frame(s.player.animTime,Math.abs(s.player.vx),s.player.attackTimer>0));
  const camX=clamp(s.player.x-270,-2500,1780);this.scene.cameras.main.scrollX=Phaser.Math.Linear(this.scene.cameras.main.scrollX,camX,.16);
  this.animateWorld();this.atmosphere();
 }
 private frame(t:number,speed:number,attack:boolean){if(attack)return 2;return speed<3?0:Math.floor(t*8)%6}
 private syncBuilding(id:string,x:number,kind:string,level:number){
  const tex=kind==="castle"?(level>1?"castle2":"castle1"):kind==="farm"?"farm":kind==="barn"?"barn":kind==="tower"?"tower":kind==="blacksmith"?"blacksmith":kind==="training"?"training":kind==="cannon"?"cannon":kind==="wall"?"wall":"farm";
  let o=this.objs.get(id);if(!o){o=this.scene.add.image(x,G,tex).setOrigin(.5,1).setDepth(11);this.objs.set(id,o)}o.setTexture(tex).setPosition(x,G);
 }
 private syncActor(id:string,x:number,kind:string,rank:number,combat:boolean,vx:number,animTime:number){
  let key=kind==="guard"?"guard":kind==="archer"?"archer":kind==="farmer"?"farmer":kind==="villager"?"villager":kind==="cow"?"cow":kind==="bull"?"bull":kind==="sheep"?"sheep":kind==="horse"?"horse":kind==="deer"?"deer":kind==="bison"?"bison":kind==="rabbit"?"rabbit":kind==="wolf"?"wolf":kind==="brute"?"brute":"enemy";
  let o=this.objs.get(id);
  if(!o){o=this.scene.add.image(x,G,key+"_0" in this.scene.textures.list?key+"_0":key).setOrigin(.5,1).setDepth(kind==="wolf"||kind==="rabbit"||kind==="deer"||kind==="bison"?17:20);this.objs.set(id,o)}
  if(["guard","archer","farmer","villager"].includes(key))o.setTexture(key+"_"+this.frame(animTime,Math.abs(vx),combat));else if(["cow","bull","sheep","horse","deer","bison","rabbit","wolf"].includes(key))o.setTexture(key+"_"+this.frame(animTime,Math.abs(vx),false));
  o.setPosition(x,G).setFlipX(vx<0).setAlpha((combat&&key==="enemy")?.98:1);
 }
 private syncCrop(id:string,x:number,stage:number,wind:number){let o=this.crops.get(id);if(!o){o=this.scene.add.image(x,G+5,"crop"+stage).setOrigin(.5,1).setDepth(6);this.crops.set(id,o)}o.setTexture("crop"+stage).setPosition(x,G+5);o.setAngle(this.time.weather==="wind"?Math.sin(this.t*.07+wind)*4:Math.sin(this.t*.025+wind)*1.5)}
 private syncProjectile(id:string,x:number,y:number,kind:string,vx:number,vy:number){let o=this.projectiles.get(id);if(!o){o=this.scene.add.image(x,y,kind==="cannon"?"rock":"coin").setOrigin(.5).setDepth(25);this.projectiles.set(id,o)}o.setPosition(x,y).setRotation(Math.atan2(vy,vx))}
 private animateWorld(){
  const wind=this.time.weather==="wind"?.08:this.time.weather==="rain"?.025:.012;
  this.props.iterate((o:any)=>{if(o instanceof Phaser.GameObjects.Image&&o.texture.key==="tree")o.setRotation(Math.sin(this.t*.03+o.x*.01)*wind);});
  this.pasture.setAlpha(this.time.phase==="night"?.82:1);
 }
 private atmosphere(){
  const g=this.fx;g.clear();const p=this.time.phase;g.fillStyle(0x11152b,p==="night"?.52:p==="dusk"?.22:p==="dawn"?.08:0);g.fillRect(0,0,W,H);
  const sx=(this.time.cycleTime/300)*W;g.fillStyle(p==="night"?0xe7e5cb:0xf5ca65,1);g.fillCircle(sx,105,p==="night"?21:28);
  if(this.time.weather==="rain"){g.lineStyle(2,0xb7d4e8,.5);for(let i=0;i<70;i++){const x=(i*73+this.t*12)%W,y=(i*47+this.t*20)%H;g.lineBetween(x,y,x-8,y+24)}}
  if(this.time.weather==="snow"){g.fillStyle(0xf2f5ff,.75);for(let i=0;i<55;i++){const x=(i*61+this.t*3)%W,y=(i*83+this.t*8)%H;g.fillCircle(x,y,2)}}
  if(this.time.weather==="fog"){g.fillStyle(0xdce5e4,.13);g.fillRect(0,330,W,300)}
 }
}
function clamp(v:number,a:number,b:number){return Math.max(a,Math.min(b,v))}
