import {GameState} from "./Types";
const KEY="royal-shepherd-save-v3";const BACKUP=KEY+"-backup";
export class SaveManager{
 save(s:GameState){try{const raw=JSON.stringify(s);const old=localStorage.getItem(KEY);if(old)localStorage.setItem(BACKUP,old);localStorage.setItem(KEY,raw);return true}catch{return false}}
 load():GameState|null{try{const x=localStorage.getItem(KEY);if(!x)return null;const s=JSON.parse(x) as GameState;if(!s.version||s.version<3)return null;return s}catch{return null}}
 backup():GameState|null{try{const x=localStorage.getItem(BACKUP);return x?JSON.parse(x):null}catch{return null}}
 clear(){localStorage.removeItem(KEY);localStorage.removeItem(BACKUP)}
 exportJson(){return localStorage.getItem(KEY)||""}
 importJson(raw:string){try{const s=JSON.parse(raw);if(s.version<3)throw new Error("old");localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}}
}