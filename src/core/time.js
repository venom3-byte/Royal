import {DAY_LENGTH,SEASON_LENGTH,PHASES,SEASONS,WEATHER} from "../config.js";
import {emit} from "./events.js";
export function currentPhase(state){const q=state.time%DAY_LENGTH;return PHASES.find(p=>q>=p.start&&q<p.end)||PHASES[0]}
export function isNight(state){return currentPhase(state).id==="night"}
export function seasonData(state){return SEASONS[state.seasonIndex%SEASONS.length]}
export function chooseWeather(state,rng=Math.random){const pool=seasonData(state).weather;state.weather=pool[Math.floor(rng()*pool.length)];state.weatherNext=95+rng()*30;emit("weatherChanged",{id:state.weather})}
export function updateTime(state,dt){if(!state.running||state.paused||state.gameOver)return {dayChanged:false,seasonChanged:false};
 const prevDay=Math.floor(state.time/DAY_LENGTH),prevSeason=Math.floor(state.time/SEASON_LENGTH)%SEASONS.length;
 state.time+=dt;state.day=1+Math.floor(state.time/DAY_LENGTH);state.seasonIndex=Math.floor(state.time/SEASON_LENGTH)%SEASONS.length;
 const dayChanged=prevDay!==Math.floor(state.time/DAY_LENGTH),seasonChanged=prevSeason!==state.seasonIndex;
 state.weatherNext-=dt;if(state.weatherNext<=0)chooseWeather(state);
 if(dayChanged)emit("dayChanged",{day:state.day});if(seasonChanged)emit("seasonChanged",{season:seasonData(state)});
 return {dayChanged,seasonChanged};}