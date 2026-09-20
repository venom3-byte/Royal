export class SoundSystem{
 constructor(){this.ctx=null;this.master=null;this.enabled=true;this.last={}}
 init(){
  if(this.ctx)return;
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.055;this.master.connect(this.ctx.destination);
 }
 resume(){if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume()}
 tone(freq,duration=.08,type="sine",gain=.06){
  if(!this.ctx||!this.enabled)return;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,this.ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+duration);
  o.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+duration);
 }
 noise(duration=.12,gain=.025){
  if(!this.ctx||!this.enabled)return;
  const n=this.ctx.createBufferSource(),b=this.ctx.createBuffer(1,Math.floor(this.ctx.sampleRate*duration),this.ctx.sampleRate);
  const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
  n.buffer=b;const f=this.ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=900;f.Q.value=.6;
  const g=this.ctx.createGain();g.gain.value=gain;n.connect(f);f.connect(g);g.connect(this.master);n.start();
 }
 event(name){
  this.init();this.resume();
  const now=performance.now();if(this.last[name]&&now-this.last[name]<65)return;this.last[name]=now;
  const map={
   click:[[520,.045,"square",.035]],
   coin:[[880,.08,"triangle",.045],[1180,.07,"triangle",.03]],
   build:[[180,.18,"triangle",.05],[320,.14,"triangle",.035]],
   hit:[[110,.05,"sawtooth",.05]],
   metal:[[430,.06,"square",.045],[690,.06,"square",.025]],
   bow:[[760,.04,"triangle",.035],[420,.05,"triangle",.02]],
   cannon:[[70,.28,"sawtooth",.12],[40,.38,"square",.045]],
   alert:[[250,.11,"sine",.05],[190,.16,"sine",.04]],
   animal:[[160,.11,"triangle",.02]],
   rain:[[320,.25,"sine",.012]],
   dawn:[[300,.3,"triangle",.018],[450,.35,"triangle",.012]]
  };
  (map[name]||[]).forEach(a=>this.tone(...a));if(name==="cannon"||name==="hit")this.noise(name==="cannon"?.28:.08,name==="cannon"?.07:.02);
 }
}