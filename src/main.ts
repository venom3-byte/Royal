import * as Phaser from "phaser";
import "../assets/rsk_assets.js";
import "./styles.css";
import {BootScene} from "./scenes/BootScene";
import {WorldScene} from "./scenes/WorldScene";
import {UIScene} from "./scenes/UIScene";
import {GAME_WIDTH,GAME_HEIGHT} from "./core/constants";

declare global{interface Window{RSK_ASSETS?:Record<string,string>}}

const root=document.getElementById("game-root")!;
const errorBox=document.getElementById("boot-error")!;
window.addEventListener("error",e=>{errorBox.hidden=false;errorBox.textContent="Game Error\n"+(e.error?.stack||e.message)});
window.addEventListener("unhandledrejection",e=>{errorBox.hidden=false;errorBox.textContent="Game Promise Error\n"+String(e.reason?.stack||e.reason)});

const config:Phaser.Types.Core.GameConfig={
 type:Phaser.AUTO,
 parent:root,
 width:GAME_WIDTH,
 height:GAME_HEIGHT,
 backgroundColor:"#09131c",
 pixelArt:true,
 antialias:false,
 roundPixels:true,
 scale:{mode:Phaser.Scale.RESIZE,width:GAME_WIDTH,height:GAME_HEIGHT,autoCenter:Phaser.Scale.CENTER_BOTH},
 physics:{default:"arcade",arcade:{gravity:{x:0,y:0},debug:false,fps:60,fixedStep:true}},
 scene:[BootScene,WorldScene,UIScene],
 render:{powerPreference:"high-performance",transparent:false},
 banner:false
};
new Phaser.Game(config);
