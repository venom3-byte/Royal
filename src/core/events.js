const listeners=new Map();
export function on(event,fn){if(!listeners.has(event))listeners.set(event,new Set());listeners.get(event).add(fn);return()=>listeners.get(event)?.delete(fn)}
export function emit(event,payload){const set=listeners.get(event);if(!set)return;for(const fn of set)try{fn(payload)}catch(err){console.error("[EventBus]",event,err)}}
export function clearEvents(){listeners.clear()}