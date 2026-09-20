import Phaser from "phaser";import {BuildKind} from "../core/Types";
export class InputController{
 moveX=0;attack=false;coin=false;build=false;upgrade=false;private stickId=-1;private stick!:Phaser.GameObjects.Arc;private info!:Phaser.GameObjects.Text;selectedBuild:BuildKind="wall";
 readonly builds:BuildKind[]=["wall","farm","tower","barn","training","blacksmith","cannon","house"];
 constructor(private scene:Phaser.Scene){this.draw();scene.input.on("pointerdown",(p:Phaser.Input.Pointer)=>this.down(p));scene.input.on("pointermove",(p:Phaser.Input.Pointer)=>this.move(p));scene.input.on("pointerup",(p:Phaser.Input.Pointer)=>this.up(p))}
 private draw(){
  const s=this.scene;
  s.add.rectangle(360,1105,720,350,0x101822,.98).setScrollFactor(0).setDepth(150);
  s.add.rectangle(360,935,720,12,0x6f5836,1).setScrollFactor(0).setDepth(151);
  this.info=s.add.text(24,952,"بناء: سور • 18 خشب + 4 حجر",{fontSize:"17px",fontStyle:"bold",color:"#f1dfb4",backgroundColor:"#18232e",padding:{x:10,y:7}}).setScrollFactor(0).setDepth(153);
  s.add.text(520,953,"تغيير البناء",{fontSize:"15px",color:"#cbd4dc"}).setScrollFactor(0).setDepth(153);
  this.button(655,980,38,0x46643e,"↻",()=>this.nextBuild());
  s.add.circle(105,1100,78,0x263442,.98).setScrollFactor(0).setDepth(151);
  this.stick=s.add.circle(105,1100,34,0xcbd4da,.98).setScrollFactor(0).setDepth(152);
  s.add.text(105,1190,"الحركة",{fontSize:"14px",color:"#9eabb5"}).setOrigin(.5).setScrollFactor(0).setDepth(153);
  this.button(500,1040,54,0x8d6a2d,"🪙",()=>this.coin=true);
  this.button(630,1040,54,0x7a2f33,"⚔",()=>this.attack=true);
  this.button(500,1155,54,0x335b82,"🏗",()=>this.build=true);
  this.button(630,1155,54,0x6a5630,"⬆",()=>this.upgrade=true);
  s.add.text(500,1225,"تجنيد / قتال / بناء / ترقية",{fontSize:"14px",color:"#aebbc5"}).setOrigin(.5).setScrollFactor(0).setDepth(153);
  s.add.text(630,1225,"← لمس الأزرار",{fontSize:"14px",color:"#aebbc5"}).setOrigin(.5).setScrollFactor(0).setDepth(153);
 }
 private button(x:number,y:number,r:number,color:number,label:string,fn:()=>void){
  const c=this.scene.add.circle(x,y,r,color,.98).setScrollFactor(0).setDepth(151).setInteractive({useHandCursor:false});c.setStrokeStyle(3,0xd0bd83,.85);
  this.scene.add.text(x,y,label,{fontSize:"25px"}).setOrigin(.5).setScrollFactor(0).setDepth(152);c.on("pointerdown",()=>fn());
 }
 private down(p:Phaser.Input.Pointer){if(p.y>1015&&p.x<215){this.stickId=p.id;this.setStick(p.x,p.y)}}
 private move(p:Phaser.Input.Pointer){if(p.id===this.stickId)this.setStick(p.x,p.y)}
 private up(p:Phaser.Input.Pointer){if(p.id===this.stickId){this.stickId=-1;this.moveX=0;this.stick.setPosition(105,1100)}}
 private setStick(x:number,y:number){const dx=x-105,dy=y-1100,len=Math.max(1,Math.hypot(dx,dy)),cl=Math.min(58,len);this.stick.setPosition(105+dx/len*cl,1100+dy/len*cl);this.moveX=Math.max(-1,Math.min(1,dx/72))}
 private nextBuild(){
  const i=(this.builds.indexOf(this.selectedBuild)+1)%this.builds.length;this.selectedBuild=this.builds[i];
  const names:any={wall:"سور",farm:"مزرعة",tower:"برج",barn:"حظيرة",training:"ساحة تدريب",blacksmith:"حدادة",cannon:"مدفع",house:"مسكن"};
  const costs:any={wall:"18 خشب + 4 حجر",farm:"30 خشب + 8 حجر",tower:"35 خشب + 25 حجر",barn:"55 خشب + 20 حجر",training:"60 خشب + 25 حجر + 10 حديد",blacksmith:"65 خشب + 40 حجر + 15 حديد",cannon:"80 خشب + 55 حجر + 25 حديد + 10 زيت",house:"45 خشب + 8 حجر"};
  this.info.setText("بناء: "+names[this.selectedBuild]+" • "+costs[this.selectedBuild]);
 }
 update(){
  const k=this.scene.input.keyboard;
  if(k){
   const l=k.addKey("LEFT"),r=k.addKey("RIGHT");if(this.stickId<0)this.moveX=r.isDown?1:l.isDown?-1:0;
   if(Phaser.Input.Keyboard.JustDown(k.addKey("SPACE")))this.attack=true;
   if(Phaser.Input.Keyboard.JustDown(k.addKey("E")))this.coin=true;
   if(Phaser.Input.Keyboard.JustDown(k.addKey("B")))this.build=true;
   if(Phaser.Input.Keyboard.JustDown(k.addKey("U")))this.upgrade=true;
  }
 }
 consumeAttack(){const v=this.attack;this.attack=false;return v}consumeCoin(){const v=this.coin;this.coin=false;return v}consumeBuild(){const v=this.build;this.build=false;return v}consumeUpgrade(){const v=this.upgrade;this.upgrade=false;return v}
}