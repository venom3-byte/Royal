import Phaser from "phaser";
import {BuildKind} from "../core/Types";
export class InputController{
 moveX=0;attack=false;coin=false;build=false;private stickId=-1;private stick!:Phaser.GameObjects.Arc;private info!:Phaser.GameObjects.Text;selectedBuild:BuildKind="wall";
 readonly builds:BuildKind[]=["wall","farm","tower","barn","training","blacksmith","cannon","house"];
 constructor(private scene:Phaser.Scene){this.draw();scene.input.on("pointerdown",(p:Phaser.Input.Pointer)=>this.down(p));scene.input.on("pointermove",(p:Phaser.Input.Pointer)=>this.move(p));scene.input.on("pointerup",(p:Phaser.Input.Pointer)=>this.up(p))}
 private draw(){const s=this.scene;s.add.rectangle(360,1040,720,480,0x101822,.96).setScrollFactor(0).setDepth(150);s.add.text(28,818,"مملكة الراعي الملكي",{fontSize:"28px",fontStyle:"bold",color:"#f3dfad"}).setScrollFactor(0).setDepth(151);this.info=s.add.text(28,862,"بناء: سور",{fontSize:"18px",color:"#d4dbe0",backgroundColor:"#1a2530",padding:{x:10,y:7}}).setScrollFactor(0).setDepth(151);s.add.text(475,1015,"الأفعال",{fontSize:"18px",color:"#aebbc5"}).setScrollFactor(0).setDepth(151);s.add.circle(105,1125,76,0x263442,.9).setScrollFactor(0).setDepth(151);this.stick=s.add.circle(105,1125,34,0xc7d0d8,.9).setScrollFactor(0).setDepth(152);this.button(515,1090,62,0x8d6a2d,"🪙",()=>this.coin=true);this.button(625,1090,62,0x7a2f33,"⚔",()=>this.attack=true);this.button(515,1205,62,0x335b82,"🏗",()=>this.build=true);this.button(625,1205,62,0x46643e,"↻",()=>this.nextBuild())}
 private button(x:number,y:number,r:number,color:number,label:string,fn:()=>void){const c=this.scene.add.circle(x,y,r,color,.96).setScrollFactor(0).setDepth(151).setInteractive();c.setStrokeStyle(3,0xd0bd83,.8);this.scene.add.text(x,y,label,{fontSize:"30px"}).setOrigin(.5).setScrollFactor(0).setDepth(152);c.on("pointerdown",fn)}
 private down(p:Phaser.Input.Pointer){if(p.y>1040&&p.x<210){this.stickId=p.id;this.setStick(p.x,p.y)}}
 private move(p:Phaser.Input.Pointer){if(p.id===this.stickId)this.setStick(p.x,p.y)}
 private up(p:Phaser.Input.Pointer){if(p.id===this.stickId){this.stickId=-1;this.moveX=0;this.stick.setPosition(105,1125)}}
 private setStick(x:number,y:number){const dx=x-105,dy=y-1125,len=Math.max(1,Math.hypot(dx,dy)),cl=Math.min(55,len);this.stick.setPosition(105+dx/len*cl,1125+dy/len*cl);this.moveX=Math.max(-1,Math.min(1,dx/70))}
 private nextBuild(){const i=(this.builds.indexOf(this.selectedBuild)+1)%this.builds.length;this.selectedBuild=this.builds[i];const names:any={wall:"سور",farm:"مزرعة",tower:"برج",barn:"حظيرة",training:"ساحة تدريب",blacksmith:"حدادة",cannon:"مدفع",house:"مسكن"};this.info.setText("بناء: "+names[this.selectedBuild])}
 update(){const k=this.scene.input.keyboard;if(k){const l=k.addKey("LEFT").isDown||k.addKey("A").isDown,r=k.addKey("RIGHT").isDown||k.addKey("D").isDown;if(this.stickId<0)this.moveX=r?1:l?-1:0;if(k.addKey("SPACE").isDown)this.attack=true;if(k.addKey("E").isDown)this.coin=true;if(k.addKey("B").isDown)this.build=true}}
 consumeAttack(){const v=this.attack;this.attack=false;return v}
 consumeCoin(){const v=this.coin;this.coin=false;return v}
 consumeBuild(){const v=this.build;this.build=false;return v}
}