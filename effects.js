(function(){
if(window.RB)return;
const css=document.createElement('style');
css.textContent=`rb-split{display:inline}rb-split .w{display:inline-block;will-change:transform,filter,opacity}rb-split .rb-acc{color:var(--rb-accent,#1481E2)}rb-split .rb-shiny .w{background:linear-gradient(100deg,var(--rb-accent,#1481E2) 30%,#7CC4FF 46%,#BFE3FF 50%,#7CC4FF 54%,var(--rb-accent,#1481E2) 70%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:rbsh 5s ease-in-out infinite}@keyframes rbsh{0%{background-position:100% 0}60%,100%{background-position:0% 0}}`;
document.head.appendChild(css);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE='cubic-bezier(.2,.7,.2,1)';
const ptr={x:-9999,y:-9999};
addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY;},{passive:true});
document.addEventListener('pointerleave',()=>{ptr.x=ptr.y=-9999;});

function fitCanvas(c,host,scale=1){const r=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2)*scale;const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return {r,d};}
function visLoop(host,draw){let raf=0,on=false,vis=true;const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting;vis?start():stop();});const tick=t=>{draw(t);raf=requestAnimationFrame(tick);};const start=()=>{if(!on&&vis){on=true;raf=requestAnimationFrame(tick);}};const stop=()=>{on=false;cancelAnimationFrame(raf);};io.observe(host);return {start,stop:()=>{stop();io.disconnect();}};}

/* Interactive dot field: dots swell + glow near the cursor, click sends a shockwave */
class RbDots extends HTMLElement{
  connectedCallback(){
    this.style.display='block';if(!this.style.position)this.style.position='absolute';if(!this.style.inset)this.style.inset='0';
    const s=this.attachShadow?this.shadowRoot||this.attachShadow({mode:'open'}):this;
    s.innerHTML='<canvas style="width:100%;height:100%;display:block"></canvas>';
    const c=s.querySelector('canvas'),x=c.getContext('2d');
    const gap=+this.getAttribute('gap')||30,R=+this.getAttribute('radius')||170;
    const rip=[];
    this._down=e=>{const r=this.getBoundingClientRect();if(e.clientY<r.top||e.clientY>r.bottom)return;rip.push({x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()});if(rip.length>4)rip.shift();};
    addEventListener('pointerdown',this._down);
    const draw=t=>{
      const {r,d}=fitCanvas(c,this);x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,r.width,r.height);
      const px=ptr.x-r.left,py=ptr.y-r.top,cols=Math.ceil(r.width/gap)+1,rows=Math.ceil(r.height/gap)+1;
      const ox=(r.width-(cols-1)*gap)/2,oy=(r.height-(rows-1)*gap)/2,now=performance.now();
      const wave=(t*0.09)%(r.width+r.height);
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
        let X=ox+i*gap,Y=oy+j*gap,dx=X-px,dy=Y-py,dd=Math.hypot(dx,dy),k=Math.max(0,1-dd/R);k=k*k*(3-2*k);
        let mx=dd?dx/dd*k*16:0,my=dd?dy/dd*k*16:0,glow=k;
        for(const q of rip){const age=now-q.t,rad=age*0.7,qx=X-q.x,qy=Y-q.y,qd=Math.hypot(qx,qy),w=Math.exp(-((qd-rad)**2)/(2*28*28))*Math.max(0,1-age/1400);if(w>0.01){mx+=qd?qx/qd*w*14:0;my+=qd?qy/qd*w*14:0;glow=Math.max(glow,w);}}
        const amb=Math.exp(-((X+(r.height-Y)-wave)**2)/(2*90*90))*0.35;
        const a=0.16+amb*0.25,rad=1.5+glow*2.8+amb*0.6;
        x.beginPath();x.arc(X+mx,Y+my,rad,0,6.283);
        x.fillStyle=glow>0.04?`rgba(28,154,255,${0.25+glow*0.75})`:`rgba(60,88,150,${a})`;x.fill();
      }
      for(let n=rip.length-1;n>=0;n--)if(now-rip[n].t>1500)rip.splice(n,1);
    };
    if(RM){requestAnimationFrame(()=>draw(0));return;}
    requestAnimationFrame(()=>draw(0));setTimeout(()=>draw(0),60);
    this._l=visLoop(this,draw);this._l.start();
  }
  disconnectedCallback(){this._l&&this._l.stop();removeEventListener('pointerdown',this._down);}
}

/* Slow brand aurora for dark panels (drawn small, upscaled = free blur) */
class RbAurora extends HTMLElement{
  connectedCallback(){
    this.style.display='block';if(!this.style.position)this.style.position='absolute';if(!this.style.inset)this.style.inset='0';this.style.pointerEvents='none';
    const s=this.shadowRoot||this.attachShadow({mode:'open'});
    s.innerHTML='<canvas style="width:100%;height:100%;display:block;filter:blur(24px);transform:scale(1.15)"></canvas>';
    const c=s.querySelector('canvas'),x=c.getContext('2d');
    const cols=(this.getAttribute('colors')||'#1C9AFF,#1481E2,#3C5896,#0F6BC7').split(',');
    const op=+this.getAttribute('opacity')||0.55;
    const B=cols.map((col,i)=>({col,a:i*1.7,b:i*2.3,s:0.00011+i*0.00004,rr:0.45+((i*37)%20)/60}));
    const draw=t=>{const {r}=fitCanvas(c,this,0.12);const W=c.width,H=c.height;x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
      for(const b of B){const cx=W*(0.5+0.42*Math.sin(t*b.s+b.a)),cy=H*(0.5+0.45*Math.cos(t*b.s*1.3+b.b)),rad=Math.max(W,H)*b.rr;const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,b.col+Math.round(op*255).toString(16).padStart(2,'0'));g.addColorStop(1,b.col+'00');x.fillStyle=g;x.fillRect(0,0,W,H);}
      x.globalCompositeOperation='source-over';};
    if(RM){requestAnimationFrame(()=>draw(4000));return;}
    setTimeout(()=>draw(4000),60);
    this._l=visLoop(this,draw);this._l.start();
  }
  disconnectedCallback(){this._l&&this._l.stop();}
}

/* Word-by-word blur reveal; optional accent run that turns shiny after reveal */
class RbSplit extends HTMLElement{
  static get observedAttributes(){return['text','accent'];}
  connectedCallback(){this._ok=true;this.render();}
  attributeChangedCallback(){if(this._ok)this.render();}
  render(){
    const text=this.getAttribute('text')||'',acc=this.getAttribute('accent')||'',key=text+'|'+acc;
    if(key===this._k)return;this._k=key;
    const s=this;
    const esc=t=>t.replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
    const words=t=>t.split(/\s+/).filter(Boolean).map(w=>`<span class="w">${esc(w)}</span>`).join(' ');
    s.innerHTML=`${words(text)}${acc?` <span class="rb-acc">${words(acc)}</span>`:''}`;
    if(RM)return;
    const delay=+this.getAttribute('delay')||0,st=+this.getAttribute('stagger')||70;
    const ws=[...s.querySelectorAll('.w')];let last;
    ws.forEach((w,i)=>{last=w.animate([{opacity:0,filter:'blur(14px)',transform:'translateY(40%) scale(.96)'},{opacity:1,filter:'blur(0)',transform:'none'}],{duration:820,delay:delay+i*st,easing:EASE,fill:'backwards'});});
    const a=s.querySelector('.rb-acc');
    if(a&&last&&this.hasAttribute('shiny'))last.onfinish=()=>a.classList.add('rb-shiny');
  }
}

/* Scramble-then-resolve text */
const HE='אבגדהוזחטיכלמנסעפצקרשת0123456789';
class RbDecrypt extends HTMLElement{
  static get observedAttributes(){return['text'];}
  connectedCallback(){this._ok=true;this.run();}
  attributeChangedCallback(){if(this._ok)this.run();}
  disconnectedCallback(){cancelAnimationFrame(this._r);}
  run(){
    const t=this.getAttribute('text')||'';if(t===this._t)return;this._t=t;
    if(RM){this.textContent=t;return;}
    const t0=performance.now()+(+this.getAttribute('delay')||0),dur=Math.max(500,t.length*32);
    cancelAnimationFrame(this._r);this.textContent=t;
    const f=n=>{const p=Math.max(0,Math.min(1,(n-t0)/dur)),k=Math.floor(p*t.length);
      this.textContent=t.split('').map((ch,i)=>i<k||ch===' '?ch:HE[(Math.random()*HE.length)|0]).join('');
      if(p<1)this._r=requestAnimationFrame(f);};
    this._r=requestAnimationFrame(f);
  }
}

/* Animated number */
class RbCount extends HTMLElement{
  static get observedAttributes(){return['value'];}
  connectedCallback(){this._v=0;this._ok=true;this.style.fontVariantNumeric='tabular-nums';this.go();}
  attributeChangedCallback(){if(this._ok)this.go();}
  go(){
    const to=+this.getAttribute('value')||0,from=this._v||0,suf=this.getAttribute('suffix')||'',dur=+this.getAttribute('duration')||1000;
    cancelAnimationFrame(this._r);const t0=performance.now();this.textContent=Math.round(from)+suf;clearTimeout(this._s);this._s=setTimeout(()=>{if(Math.round(this._v)!==to){this._v=to;this.textContent=to+suf;}},dur+400);
    const f=n=>{const p=RM?1:Math.min(1,(n-t0)/dur),e=1-Math.pow(1-p,3);this._v=from+(to-from)*e;this.textContent=Math.round(this._v)+suf;if(p<1)this._r=requestAnimationFrame(f);};
    this._r=requestAnimationFrame(f);
  }
}

/* Orbiting light border */
class RbBorder extends HTMLElement{
  connectedCallback(){
    if(this.shadowRoot)return;
    const r=this.getAttribute('radius')||'14',col=this.getAttribute('color')||'#1C9AFF',bg=this.getAttribute('bg')||'#1E2E53',sp=this.getAttribute('speed')||'3.6s';
    const s=this.attachShadow({mode:'open'});
    s.innerHTML=`<style>:host{display:inline-flex;position:relative;border-radius:${r}px;padding:2px;overflow:hidden;isolation:isolate;background:${bg};box-shadow:0 10px 30px -10px rgba(28,154,255,.55)}.o{position:absolute;inset:-180%;z-index:-1;background:conic-gradient(from 0deg,transparent 0 62%,${col} 78%,#BFE3FF 82%,${col} 86%,transparent 96%);animation:s ${sp} linear infinite}@keyframes s{to{transform:rotate(1turn)}}::slotted(*){border-radius:${Math.max(0,r-2)}px !important}@media (prefers-reduced-motion:reduce){.o{animation:none}}</style><div class="o"></div><slot></slot>`;
  }
}

[['rb-dots',RbDots],['rb-aurora',RbAurora],['rb-split',RbSplit],['rb-decrypt',RbDecrypt],['rb-count',RbCount],['rb-border',RbBorder]].forEach(([n,c])=>{if(!customElements.get(n))customElements.define(n,c);});

/* ---------- global overlay: click sparks + confetti ---------- */
const ov=document.createElement('canvas');
ov.setAttribute('aria-hidden','true');
ov.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';
const P=[];let ovOn=false;
function ensureOv(){if(!ov.isConnected)document.body.appendChild(ov);const d=Math.min(devicePixelRatio||1,2);const w=innerWidth*d,h=innerHeight*d;if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}return d;}
function loop(){const d=ensureOv(),x=ov.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,innerWidth,innerHeight);const now=performance.now();
  for(let i=P.length-1;i>=0;i--){const p=P[i],age=now-p.t0,k=age/p.life;if(k>=1){P.splice(i,1);continue;}
    if(p.kind==='spark'){const e=1-Math.pow(1-k,3),d1=p.dist*e,len=p.len*(1-k);x.strokeStyle=p.col;x.lineWidth=2;x.lineCap='round';x.beginPath();x.moveTo(p.x+Math.cos(p.a)*d1,p.y+Math.sin(p.a)*d1);x.lineTo(p.x+Math.cos(p.a)*(d1+len),p.y+Math.sin(p.a)*(d1+len));x.stroke();}
    else{p.vy+=0.18;p.vx*=0.99;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;x.save();x.globalAlpha=Math.min(1,(1-k)*2);x.translate(p.x,p.y);x.rotate(p.rot);x.scale(1,Math.cos(age*p.flip));x.fillStyle=p.col;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore();}}
  if(P.length)requestAnimationFrame(loop);else{ovOn=false;x.clearRect(0,0,innerWidth,innerHeight);}}
function kick(){if(!ovOn){ovOn=true;requestAnimationFrame(loop);}}
function spark(x,y,col='#1C9AFF',n=9){if(RM)return;const t0=performance.now();for(let i=0;i<n;i++)P.push({kind:'spark',x,y,a:i/n*6.283+Math.random()*0.3,dist:22+Math.random()*8,len:11,col,t0,life:460});kick();}
function confetti(x=innerWidth/2,y=innerHeight*0.32,n=150){if(RM)return;const cols=['#1C9AFF','#1481E2','#1E2E53','#3C5896','#DCE2F7','#9FD3FF'];const t0=performance.now();
  for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-0.5)*Math.PI*1.25,v=6+Math.random()*9;P.push({kind:'c',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:6+Math.random()*6,h:8+Math.random()*8,rot:Math.random()*6,vr:(Math.random()-0.5)*0.3,flip:0.004+Math.random()*0.01,col:cols[i%cols.length],t0,life:2200+Math.random()*900});}kick();}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button,[data-spark]');if(!b||b.disabled)return;spark(e.clientX,e.clientY,b.dataset.spark&&b.dataset.spark.startsWith('#')?b.dataset.spark:'#1C9AFF');},true);

/* ---------- spotlight / tilt / magnet ---------- */
let tilted=null,mq=0;
document.addEventListener('pointermove',e=>{
  const sp=e.target.closest&&e.target.closest('[data-spot]');
  if(sp){const r=sp.getBoundingClientRect();sp.style.setProperty('--mx',(e.clientX-r.left)+'px');sp.style.setProperty('--my',(e.clientY-r.top)+'px');}
  const tl=e.target.closest&&e.target.closest('[data-tilt]');
  if(tilted&&tilted!==tl){tilted.style.transform='';tilted=null;}
  if(tl&&!RM){const r=tl.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-0.5,ny=(e.clientY-r.top)/r.height-0.5,m=+tl.dataset.tilt||8;tl.style.transition='transform .25s ease-out';tl.style.transform=`perspective(1000px) rotateX(${(-ny*m).toFixed(2)}deg) rotateY(${(nx*m).toFixed(2)}deg)`;tilted=tl;}
  if(false){mq=requestAnimationFrame(()=>{mq=0;document.querySelectorAll('[data-magnet]').forEach(el=>{const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=ptr.x-cx,dy=ptr.y-cy,pad=70,inside=Math.abs(dx)<r.width/2+pad&&Math.abs(dy)<r.height/2+pad,s=+el.dataset.magnet||0.25;el.style.transition='translate .35s cubic-bezier(.2,.7,.2,1)';el.style.translate=inside?`${(dx*s).toFixed(1)}px ${(dy*s).toFixed(1)}px`:'0 0';});});}
},{passive:true});

/* ---------- reveal on enter + floating ---------- */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);if(RM)return;const i=+el.dataset.reveal||0,y=+el.dataset.revealY||22;
  el.animate([{opacity:0,transform:`translateY(${y}px)`,filter:'blur(8px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:+el.dataset.revealDur||720,delay:i*70,easing:EASE,fill:'backwards'});}),{threshold:0.05});
function scan(root){root.querySelectorAll&&root.querySelectorAll('[data-reveal]:not([data-rv])').forEach(el=>{el.setAttribute('data-rv','');io.observe(el);});
  root.querySelectorAll&&root.querySelectorAll('[data-float]:not([data-fl])').forEach(el=>{el.setAttribute('data-fl','');if(RM)return;const a=+el.dataset.float||10;el.animate([{translate:'0 0'},{translate:`0 ${-a}px`},{translate:'0 0'}],{duration:4200+Math.random()*1800,iterations:Infinity,easing:'ease-in-out',delay:-Math.random()*3000});});}
const mo=new MutationObserver(ms=>{for(const m of ms)m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches&&(n.matches('[data-reveal]')||n.matches('[data-float]')))scan(n.parentNode||document);scan(n);}});});
function boot(){scan(document);mo.observe(document.body,{childList:true,subtree:true});}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();

window.RB={spark,confetti};
})();
