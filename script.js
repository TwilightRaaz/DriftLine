// Keep the desktop composition at its designed size on smaller displays.
function sizeArtboard(){const page=document.querySelector('.page');if(page)page.style.zoom=window.innerWidth<=1199?1:Math.min(1,window.innerWidth/1512)}
sizeArtboard();window.addEventListener('resize',sizeArtboard);

// ---------------------------------------------------------------------------
// Loader — timings taken from the Figma loader screen:
//   0.00s  bar starts filling (460 x 24 track)
//   1.83s  bar reaches 100%
//   2.25s  DRIFTLINE label starts fading out, completes at 2.62s
//   2.73s  the screen splits and the two halves slide apart
// ---------------------------------------------------------------------------
const loader=document.getElementById('loader');
const fill=document.getElementById('loader-fill');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FILL_DURATION=1833;
let progress=0;
let finished=false;

function setProgress(value){
  progress=Math.max(progress,Math.min(1,value));
  if(fill)fill.style.width=(progress*100)+'%';
}

function splitCurtain(){
  if(finished)return;
  finished=true;
  if(reduceMotion||!loader){
    if(loader)loader.classList.add('is-hidden');
    document.documentElement.classList.add('loader-done');
    document.documentElement.classList.remove('loader-active');
    return;
  }
  loader.classList.remove('is-loading');
  loader.classList.add('is-complete');
  // The label fades out, then the curtain splits.
  setTimeout(()=>{loader.classList.add('is-splitting');playHeroEntrance()},373);
  setTimeout(()=>{
    loader.classList.add('is-hidden');
    document.documentElement.classList.add('loader-done');
    document.documentElement.classList.remove('loader-active');
  },373+1900);
}

// Fill the bar with the same easing curve the Figma animation uses.
function animateFill(){
  const start=performance.now();
  const step=(now)=>{
    if(finished)return;
    const t=Math.min(1,(now-start)/FILL_DURATION);
    // The Figma keyframes use a cubic bezier with i.x=1, i.y=1, o.x=0, o.y=0.
    const eased=1-Math.pow(1-t,3);
    setProgress(eased);
    if(t<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if(loader&&!reduceMotion){
  loader.classList.add('is-loading');
  animateFill();
  // The split happens on the design's timeline rather than on page load.
  setTimeout(()=>{setProgress(1);splitCurtain()},FILL_DURATION+420);
  // Safety net: never trap the visitor behind the loader.
  setTimeout(()=>{setProgress(1);splitCurtain()},10000);
}else if(loader){
  loader.classList.add('is-hidden');
  document.documentElement.classList.add('loader-done');
    document.documentElement.classList.remove('loader-active');
}

// Hero movement follows sampled position keyframes from the supplied Lottie.
// Timings are relative to the moment its curtains begin opening (2.73s).
function playHeroEntrance(){
  if(reduceMotion || !window.heroKeyframes || !Element.prototype.animate)return;
  const splitTime=2.73;
  const targets={nav:'.nav',heading:'.hero-copy h1',description:'.hero-copy p',bike:'.bike'};
  Object.entries(targets).forEach(([name,selector])=>{
    const element=document.querySelector(selector);const data=window.heroKeyframes[name];
    if(!element||!data)return;
    const frames=data.points.map(([offset,x,y])=>({offset,transform:`translate(${x}px, ${y}px)`}));
    element.animate(frames,{duration:data.duration*1000,delay:(data.start-splitTime)*1000,fill:'both'});
  });
  const bike=document.querySelector('.bike');
  if(bike)bike.animate([{opacity:0},{opacity:1}],{duration:(3.564-3.098)*1000,delay:(3.098-splitTime)*1000,easing:'cubic-bezier(.64136016,.00420282,.92087066,.56239206)',fill:'both'});
  const button=document.querySelector('.hero-copy .cta');
  if(button)button.animate([{opacity:0},{opacity:1}],{duration:700,delay:(4.334-splitTime)*1000,easing:'cubic-bezier(.54,.03,.17,.99)',fill:'both'});
}

// Individual About layers use position samples from Motion Video Final.
function playAboutEntrance(){
  if(reduceMotion||!window.aboutKeyframes||!Element.prototype.animate)return;
  const targets={kicker:'.about-kicker',club:'.about-heading .club',standard:'.about-heading .standard',body:'.about-text'};
  for(const [name,selector] of Object.entries(targets)){
    const element=document.querySelector(selector), data=window.aboutKeyframes[name];
    if(!element||!data)continue;
    const frames=data.points.map(([offset,x,y])=>({offset,transform:`translate(${x}px, ${y}px)`}));
    element.animate(frames,{duration:data.duration*1000,delay:data.start*1000,fill:'both'});
  }
}

// FAQ card entrance tracks from the supplied Lottie; page movement remains user-controlled.
function playFaqEntrance(){
  if(reduceMotion||!window.faqKeyframes||!Element.prototype.animate)return;
  document.querySelectorAll('.question').forEach((card,i)=>{
    const data=window.faqKeyframes[i];if(!data)return;
    card.animate(data.points.map(([offset,y])=>({offset,transform:`translateY(${y}px)`})),{duration:data.duration*1000,fill:'both'});
  });
}

// Footer elements reveal using the source Lottie's sampled movement and masks.
function playFooterEntrance(){
  if(reduceMotion||!window.footerKeyframes||!Element.prototype.animate)return;
  const origin=29.946;
  const fade=(element,start,duration)=>element.animate([{opacity:0},{opacity:1}],{delay:(start-origin)*1000,duration:duration*1000,easing:'cubic-bezier(.72,-.03,.23,.98)',fill:'both'});
  const label=document.querySelector('.footer-contact-label');if(label)fade(label,29.946,.5406);
  for(const [name,selector] of Object.entries({email:'.footer-email',phone:'.footer-phone'})){
    const el=document.querySelector(selector),data=window.footerKeyframes[name];if(!el||!data)continue;
    el.animate(data.points.map(([offset,y])=>({offset,transform:`translateY(${y}px)`})),{delay:(data.start-origin)*1000,duration:data.duration*1000,fill:'both'});
    fade(el,name==='email'?30.145:30.379,.5406);
  }
  for(const [name,selector] of Object.entries({nav:'.footer-navigation',legal:'.footer-legal',social:'.footer-social',copyright:'.footer-copyright'})){
    const el=document.querySelector(selector),data=window.footerKeyframes[name];if(!el||!data)continue;
    el.animate(data.points.map(([offset,value])=>({offset,clipPath:`inset(0 0 ${(1-Math.max(0,Math.min(1,value)))*100}% 0)`})),{delay:(data.start-origin)*1000,duration:data.duration*1000,fill:'both'});
  }
}

// ---------------------------------------------------------------------------
// Section reveals are driven by the visitor's own scrolling.
// ---------------------------------------------------------------------------
document.documentElement.classList.add('motion');
const observer=new IntersectionObserver((entries)=>{
  for(const entry of entries){
    if(entry.isIntersecting){entry.target.classList.add('in-view');if(entry.target.classList.contains('about'))playAboutEntrance();if(entry.target.classList.contains('faq'))playFaqEntrance();if(entry.target.classList.contains('footer'))playFooterEntrance();observer.unobserve(entry.target)}
  }
},{threshold:0.15});
document.querySelectorAll('.about,.faq,.community,.journey .step,.journey .number,.route,.footer').forEach(element=>observer.observe(element));
// Visitors choose the active Ride Ready card; arrows stop at either end.
const featureCards=Array.from(document.querySelectorAll('.feature-card'));
const previousFeature=document.querySelector('.feature-prev');
const nextFeature=document.querySelector('.feature-next');
let activeFeature=0;
function selectFeature(index){
  if(index<0||index>=featureCards.length)return;
  activeFeature=index;
  featureCards.forEach((card,i)=>{card.classList.toggle('is-selected',i===index);card.setAttribute('aria-pressed',String(i===index));});
  if(previousFeature)previousFeature.disabled=index===0;
  if(nextFeature)nextFeature.disabled=index===featureCards.length-1;
}
featureCards.forEach((card,index)=>card.addEventListener('click',()=>selectFeature(index)));
if(previousFeature)previousFeature.addEventListener('click',()=>selectFeature(activeFeature-1));
if(nextFeature)nextFeature.addEventListener('click',()=>selectFeature(activeFeature+1));

// FAQ answers are independent; each button controls its own panel.
document.querySelectorAll('.faq-toggle').forEach(button=>{
  button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';
    button.setAttribute('aria-expanded',String(!expanded));
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    if(panel)panel.setAttribute('aria-hidden',String(expanded));
  });
});

// Scroll-scrub the Community composition at a constant route speed.
// Checkpoint fractions (0, 0.324, 0.661, 1) are the measured arc-length
// positions where the route passes each marker in the original design.
// Constant arc-length speed replaces the Lottie's eased rush-and-hold pacing,
// so equal scrolling draws an equal length of route on every leg.
const community=document.querySelector('.community');
const communityPin=document.querySelector('.community-pin');
const communityStage=document.querySelector('.community-stage');
const communityData=window.communityKeyframes;
if(community&&communityPin&&communityStage&&communityData){
  const steps=Array.from(community.querySelectorAll('.community-step'));
  const numbers=Array.from(community.querySelectorAll('.community-number'));
  const markers=Array.from(community.querySelectorAll('.community-marker'));
  const routeReveal=community.querySelector('#route-reveal');
  const routePath=community.querySelector('#community-path');
  let routeLength=0;
  // Scrub progress where the constant-speed route reaches each checkpoint,
  // with a small intro before the draw starts and an outro to finish step 4.
  const arrivals=[0,0.324,0.661,1].map(f=>0.04+0.86*f);
  const INTRO=0.04,SPAN=0.86,WIPE=0.09,LEAD=0.03,TAIL=0.04;
  function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
  function sizeCommunity(){
    if(reduceMotion){const height=window.innerWidth<=1199?1050:1582;community.style.height=height+'px';communityPin.style.height=height+'px';if(routeReveal)routeReveal.setAttribute('height','860');return;}
    const page=document.querySelector('.page');
    const mobile=window.innerWidth<=1199;
    const scale=mobile?1:(page.getBoundingClientRect().width/1512 || 1);
    const svg=community.querySelector('.community-route');
    if(svg){svg.setAttribute('preserveAspectRatio','xMidYMid meet');community.querySelectorAll('.community-marker circle').forEach(circle=>circle.removeAttribute('transform'));}
    if(routePath)routePath.removeAttribute('vector-effect');
    const visible=window.innerHeight/scale;
    communityPin.style.height=visible+'px';
    // One design-height of scroll provides a reversible scrub across the composition.
    community.style.height=(visible+1582)+'px';
    updateCommunity();
  }
  function updateCommunity(){
    if(reduceMotion)return;
    const rect=community.getBoundingClientRect();
    const total=Math.max(1,rect.height-window.innerHeight);
    const progress=Math.max(0,Math.min(1,-rect.top/total));
    // Constant arc-length speed: equal scrolling draws equal route on every leg.
    const routeT=Math.max(0,Math.min(1,(progress-INTRO)/SPAN));
    const visible=communityPin.clientHeight;
    const panMax=Math.max(0,(window.innerWidth<=1199?1050:1582)-visible);
    // Snap the whole composition to physical pixels. Fractional scroll-driven
    // transforms can make text antialiasing shimmer as it is being revealed.
    const visualScale=(window.innerWidth<=1199?1:(document.querySelector('.page').getBoundingClientRect().width/1512 || 1))*(window.devicePixelRatio||1);
    const snap=value=>Math.round(value*visualScale)/visualScale;
    communityStage.style.transform=`translate3d(0, ${snap(-panMax*routeT)}px, 0)`;
    if(routePath){
      if(!routeLength)routeLength=routePath.getTotalLength();
      routePath.style.strokeDasharray=String(routeLength);
      routePath.style.strokeDashoffset=String(routeLength*(1-routeT));
    }
    if(routeReveal)routeReveal.setAttribute('height','860');
    markers.forEach((marker,i)=>{
      // Checkpoint fade-in only, no scale overshoot.
      marker.style.opacity=String(smooth((progress-(arrivals[i]-LEAD))/(LEAD+TAIL)));
      marker.style.removeProperty('scale');
    });
    steps.forEach((step,i)=>{
      const value=smooth((progress-arrivals[i])/WIPE);
      const hidden=snap((1-value)*step.offsetHeight);
      step.style.clipPath=`inset(0 0 ${hidden}px 0)`;
    });
    numbers.forEach((number,i)=>{
      const value=smooth((progress-arrivals[i])/WIPE);
      const hidden=snap((1-value)*number.offsetHeight);
      number.style.clipPath=`inset(0 0 ${hidden}px 0)`;
    });
  }
  sizeCommunity();window.addEventListener('resize',sizeCommunity);
  let scrollFrame=0;
  window.addEventListener('scroll',()=>{
    if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateCommunity()});
  },{passive:true});
}

// Compact navigation on phones; desktop links remain visible.
const mobileMenuToggle=document.querySelector('.mobile-menu-toggle');
const mainMenu=document.getElementById('main-menu');
if(mobileMenuToggle&&mainMenu){
  function setMenu(open){mobileMenuToggle.setAttribute('aria-expanded',String(open));mobileMenuToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');}
  mobileMenuToggle.addEventListener('click',()=>setMenu(mobileMenuToggle.getAttribute('aria-expanded')!=='true'));
  mainMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
}
