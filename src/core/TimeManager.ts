import {SEASONS,Season,Phase,Weather} from "./Types";
export class TimeManager{
 static readonly CYCLE=300;static readonly SEASON=600;elapsed=0;seasonIndex=0;weather:Weather="clear";weatherAge=0;onPhase:(p:Phase)=>void=()=>{};onSeason:(s:Season)=>void=()=>{};
 update(dt:number){
  const oldP=this.phase,oldS=this.season;this.elapsed=Math.max(0,this.elapsed+dt);this.seasonIndex=Math.floor(this.elapsed/TimeManager.SEASON)%4;this.weatherAge+=dt;
  if(this.weatherAge>=120){this.weatherAge=0;const pool:Weather[]=this.season==="winter"?["snow","fog","clear"]:this.season==="spring"?["rain","fog","clear"]:this.season==="autumn"?["wind","clear","fog"]:["clear","heat","rain"];this.weather=pool[Math.floor(Math.random()*pool.length)]}
  if(oldP!==this.phase)this.onPhase(this.phase);if(oldS!==this.season)this.onSeason(this.season)
 }
 get season():Season{return SEASONS[this.seasonIndex%4]}
 get cycleTime(){return this.elapsed%TimeManager.CYCLE}
 get phase():Phase{const t=this.cycleTime;return t<30?"dawn":t<180?"day":t<210?"dusk":"night"}
 get day(){return Math.floor(this.elapsed/TimeManager.CYCLE)+1}
 get phaseProgress(){const t=this.cycleTime;return t<30?t/30:t<180?(t-30)/150:t<210?(t-180)/30:(t-210)/90}
}