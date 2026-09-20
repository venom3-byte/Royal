import Phaser from "phaser";
import {GameState} from "../core/Types";
import {TimeManager} from "../core/TimeManager";
export class HUD{
 private text:Phaser.GameObjects.Text;private phaseRing:Phaser.GameObjects.Graphics;private hint:Phaser.GameObjects.Text;
 constructor(private scene:Phaser.Scene,private state:GameState,private time:TimeManager){
  this.phaseRing=scene.add.graphics().setScrollFactor(0).setDepth(200);
  this.text=scene.add.text(18,16,"",{fontSize:"20px",color:"#f4eee1",fontStyle:"bold",backgroundColor:"#111925dd",padding:{x:12,y:10}}).setScrollFactor(0).setDepth(201);
  this.hint=scene.add.text(18,730,"",{fontSize:"16px",color:"#f3dfad",backgroundColor:"#111925bb",padding:{x:10,y:8}}).setScrollFactor(0).setDepth(201);
 }
 update(){
  const s=this.state,t=this.time;
  const season:any={spring:"ربيع",summer:"صيف",autumn:"خريف",winter:"شتاء"};const phase:any={dawn:"فجر",day:"نهار",dusk:"غروب",night:"ليل"};
  this.text.setText("🪙 "+Math.floor(s.resources.coins)+"  🌾 "+Math.floor(s.resources.food)+"  🪵 "+s.resources.wood+"  🪨 "+s.resources.stone+"  ⛓ "+s.resources.iron+"\n"+season[t.season]+" • "+phase[t.phase]+" • يوم "+s.day+" • موجة "+s.wave+" • ❤ "+Math.max(0,Math.floor(s.player.health)));
  this.hint.setText("اسحب العصا للحركة  •  🪙 تجنيد  •  ⚔ قتال  •  🏗 بناء  •  ↻ تغيير البناء");
  this.phaseRing.clear();const cx=655,cy=92,r=38;this.phaseRing.lineStyle(7,0x2d3a45,.95);this.phaseRing.strokeCircle(cx,cy,r);this.phaseRing.lineStyle(7,t.phase==="night"?0xb75661:0xd7b34c,1);this.phaseRing.beginPath();this.phaseRing.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*t.phaseProgress,false);this.phaseRing.strokePath();this.phaseRing.fillStyle(t.phase==="night"?0x263047:0x3e3a2a,1);this.phaseRing.fillCircle(cx,cy,24);this.scene.add.text(cx,cy,t.phase==="night"?"☾":"☼",{fontSize:"20px"}).setOrigin(.5).setScrollFactor(0).setDepth(202).setAlpha(.001);
 }
}
