import Phaser from "phaser";import {GameState} from "../core/Types";import {TimeManager} from "../core/TimeManager";
export class HUD{
 private text:Phaser.GameObjects.Text;private phaseRing:Phaser.GameObjects.Graphics;private hint:Phaser.GameObjects.Text;private icon:Phaser.GameObjects.Text;
 constructor(private scene:Phaser.Scene,private state:GameState,private time:TimeManager){
  this.phaseRing=scene.add.graphics().setScrollFactor(0).setDepth(200);
  this.text=scene.add.text(16,14,"",{fontSize:"17px",lineSpacing:5,color:"#f4eee1",fontStyle:"bold",backgroundColor:"#111925dd",padding:{x:10,y:8},wordWrap:{width:515}}).setScrollFactor(0).setDepth(201);
  this.icon=scene.add.text(655,78,"☼",{fontSize:"20px"}).setOrigin(.5).setScrollFactor(0).setDepth(202);
  this.hint=scene.add.text(18,865,"",{fontSize:"15px",color:"#f3dfad",backgroundColor:"#111925dd",padding:{x:10,y:7}}).setScrollFactor(0).setDepth(201);
 }
 update(){
  const s=this.state,t=this.time;const season:any={spring:"ربيع",summer:"صيف",autumn:"خريف",winter:"شتاء"};const phase:any={dawn:"فجر",day:"نهار",dusk:"غروب",night:"ليل"};
  this.text.setText("🪙 "+Math.floor(s.resources.coins)+"   🌾 "+Math.floor(s.resources.food)+"   🪵 "+s.resources.wood+"   🪨 "+s.resources.stone+"\n⛓ "+s.resources.iron+"   🥩 "+s.resources.meat+"   🥛 "+s.resources.milk+"   🛢 "+s.resources.oil+"    ❤ "+Math.max(0,Math.floor(s.player.health)));
  this.hint.setText(season[t.season]+" • "+phase[t.phase]+" • يوم "+s.day+" • موجة "+s.wave+"     اسحب العصا للحركة");
  this.phaseRing.clear();const cx=655,cy=78,r=35;this.phaseRing.lineStyle(7,0x2d3a45,.95);this.phaseRing.strokeCircle(cx,cy,r);this.phaseRing.lineStyle(7,t.phase==="night"?0xb75661:0xd7b34c,1);this.phaseRing.beginPath();this.phaseRing.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*t.phaseProgress,false);this.phaseRing.strokePath();this.icon.setText(t.phase==="night"?"☾":"☼");
 }
}