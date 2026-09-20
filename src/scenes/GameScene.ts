import Phaser from "phaser";import {WorldGenerator} from "../world/WorldGenerator";import {TimeManager} from "../core/TimeManager";import {SaveManager} from "../core/SaveManager";import {WorldSimulation} from "../systems/WorldSimulation";import {WorldRenderer} from "../systems/WorldRenderer";import {InputController} from "../systems/InputController";import {AudioSystem} from "../systems/AudioSystem";import {HUD} from "../ui/HUD";import {makeArt} from "../systems/Art";
export class GameScene extends Phaser.Scene{
 state:any;timeMgr!:TimeManager;sim!:WorldSimulation;world!:WorldRenderer;controls!:InputController;hud!:HUD;audio=new AudioSystem();save=new SaveManager();saveTimer=0;
 constructor(){super("Game")}
 create(){
  makeArt(this);const loaded=this.save.load() as any;this.state=loaded&&loaded.version>=3?loaded:WorldGenerator.make((Date.now()/1000|0)&0xfffffff);
  this.timeMgr=new TimeManager();this.timeMgr.elapsed=this.state.time||0;this.timeMgr.seasonIndex=this.state.seasonIndex||0;this.timeMgr.weather=this.state.weather||"clear";
  this.sim=new WorldSimulation(this.state,this.timeMgr);this.controls=new InputController(this);this.world=new WorldRenderer(this,this.state,this.timeMgr);this.hud=new HUD(this,this.state,this.timeMgr);
  this.timeMgr.onPhase=p=>{if(p==="night")this.audio.night()};this.timeMgr.onSeason=()=>this.audio.build()
 }
 update(){
  const dt=Math.min(.05,this.game.loop.delta/1000);this.controls.update();
  const didAttack=this.controls.consumeAttack(),didCoin=this.controls.consumeCoin(),didBuild=this.controls.consumeBuild(),didUpgrade=this.controls.consumeUpgrade();
  this.sim.moveX=this.controls.moveX;this.sim.attack=didAttack;this.sim.coin=didCoin;this.sim.build=didBuild;this.sim.upgrade=didUpgrade;this.state.selectedBuild=this.controls.selectedBuild;
  this.sim.update(dt);if(didAttack)this.audio.hit();if(didCoin)this.audio.coin();if(didBuild||didUpgrade)this.audio.build();
  this.world.render();this.hud.update();this.saveTimer+=dt;if(this.saveTimer>8){this.saveTimer=0;this.save.save(this.state)}
 }
}