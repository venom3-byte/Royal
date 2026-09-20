export class Animator{
 constructor(defs={},initial="idle"){this.defs=defs;this.state=initial;this.t=0;this.frame=0;this.playOnce=false}
 set(name,force=false){if(!force&&this.state===name)return;if(!this.defs[name])name="idle";this.state=name;this.t=0;this.frame=0;this.playOnce=name==="attack"||name==="hurt"||name==="death"}
 update(dt){const d=this.defs[this.state]||this.defs.idle;if(!d)return;this.t+=dt;const step=Math.max(.04,d.speed||.12);if(this.t>=step){const n=Math.floor(this.t/step);this.t-=n*step;this.frame+=n;if(this.frame>=d.frames){if(this.playOnce){this.frame=d.frames-1}else this.frame%=d.frames}}}
 get frameDef(){return (this.defs[this.state]||this.defs.idle)?.frameset?.[this.frame]||this.frame}
}