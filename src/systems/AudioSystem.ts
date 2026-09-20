export class AudioSystem{
 private ctx:AudioContext|null=null;
 private ensure(){if(!this.ctx)this.ctx=new AudioContext();if(this.ctx.state==="suspended")this.ctx.resume()}
 tone(freq:number,duration=.08,type:OscillatorType="sine",gain=.035){this.ensure();if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+duration);o.connect(g).connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+duration)}
 coin(){this.tone(880,.07,"triangle",.05);setTimeout(()=>this.tone(1320,.09,"triangle",.04),45)}
 build(){this.tone(180,.12,"square",.035);setTimeout(()=>this.tone(260,.14,"triangle",.03),55)}
 hit(){this.tone(110,.06,"sawtooth",.035)}
 night(){this.tone(72,.35,"sine",.035)}
}
