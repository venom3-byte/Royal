const DEFINITIONS={
 idle:{frames:4,speed:.18},walk:{frames:8,speed:.09},work:{frames:6,speed:.11},attack:{frames:6,speed:.07},hurt:{frames:3,speed:.09},death:{frames:6,speed:.10}
};
export function advanceAnimation(entity,dt){const d=DEFINITIONS[entity.anim]||DEFINITIONS.idle;entity.animTime=(entity.animTime||0)+dt;let frame=entity.animFrame||0;while(entity.animTime>=d.speed){entity.animTime-=d.speed;frame++;if(frame>=d.frames)frame=0}entity.animFrame=frame;return frame}
export function animationOffset(entity){const f=entity.animFrame||0;if(entity.anim==="walk")return {x:Math.sin(f*.9)*1.3,y:Math.abs(Math.cos(f*.8))*2.5};if(entity.anim==="attack")return {x:Math.sin(f*1.1)*2,y:0};return {x:0,y:Math.sin(f*.7)*1}}
export function animationFrameCount(name){return DEFINITIONS[name]?.frames||4}