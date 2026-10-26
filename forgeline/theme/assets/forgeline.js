document.addEventListener('DOMContentLoaded', () => {
 const toggle=document.querySelector('.fl-menu-toggle');
 const close=()=>{document.body.classList.remove('fl-menu-open');toggle?.setAttribute('aria-expanded','false');};
 toggle?.addEventListener('click',()=>{const open=document.body.classList.toggle('fl-menu-open');toggle.setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('fl-menu-open')){close();toggle?.focus();}});
 document.addEventListener('click',event=>{if(document.body.classList.contains('fl-menu-open')&&!event.target.closest('.fl-nav-widget'))close();});
 document.querySelectorAll('.fl-menu a').forEach(link=>link.addEventListener('click',close));
 const filters=[...document.querySelectorAll('.fl-filter a')];
 const cards=[...document.querySelectorAll('.fl-project-grid .fl-project-card')];
 const applyFilter=(category)=>{
  if(!['all','structural','architectural','fabrication'].includes(category))category='all';
  filters.forEach(link=>{const active=link.hash==='#'+category;link.closest('.fl-filter').classList.toggle('is-active',active);link.setAttribute('aria-pressed',String(active));});
  cards.forEach(card=>{card.hidden=category!=='all'&&!card.classList.contains('fl-category-'+category);});
 };
 filters.forEach(link=>{link.setAttribute('role','button');link.addEventListener('click',event=>{event.preventDefault();const category=link.hash.slice(1);applyFilter(category);history.replaceState(null,'','#'+category);});link.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();link.click();}});});
 if(filters.length)applyFilter(location.hash.slice(1)||'all');
 // Decorative motion never changes the saved Elementor document.
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const editing=document.body.classList.contains('elementor-editor-active')||location.search.includes('elementor-preview=');
 let paused=false;try{paused=localStorage.getItem('forgeline-motion')==='paused';}catch{}
 const header=document.querySelector('.fl-header');
 const hero=document.querySelector('.fl-hero');
 let observer;
 const showAll=()=>document.querySelectorAll('.fl-pending').forEach(node=>node.classList.remove('fl-pending'));
 if(!editing){
  const progress=document.createElement('div');progress.className='fl-scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
  if(hero){
   const atmosphere=document.createElement('div');atmosphere.className='fl-hero-atmosphere';atmosphere.setAttribute('aria-hidden','true');
   const grid=document.createElement('div');grid.className='fl-hero-grid';atmosphere.append(grid);
   for(let i=0;i<8;i++){const spark=document.createElement('i');spark.className='fl-spark';spark.style.setProperty('--spark-index',i);atmosphere.append(spark);}
   hero.prepend(atmosphere);
  }
  const control=document.createElement('button');control.type='button';control.className='fl-motion-toggle';control.innerHTML='<span class="fl-motion-symbol" aria-hidden="true">Ⅱ</span><span class="fl-motion-label">Pause motion</span>';
  (hero?.querySelector('.fl-hero-bottom')||header)?.append(control);
  const syncMotion=()=>{
   const stopped=paused||preference.matches;
   document.body.classList.toggle('fl-motion-paused',stopped);
   document.body.classList.toggle('fl-motion-ready',!stopped);
   control.hidden=preference.matches;
   control.setAttribute('aria-label',stopped?'Play decorative motion':'Pause decorative motion');
   control.setAttribute('aria-pressed',String(stopped));
   control.querySelector('.fl-motion-symbol').textContent=stopped?'▷':'Ⅱ';control.querySelector('.fl-motion-label').textContent=stopped?'Play motion':'Pause motion';
   if(stopped){showAll();observer?.disconnect();hero?.style.setProperty('--fl-parallax','0px');}
  };
  control.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('forgeline-motion',paused?'paused':'playing');}catch{}syncMotion();});
  preference.addEventListener('change',syncMotion);syncMotion();
  if('IntersectionObserver' in window&&!paused&&!preference.matches){
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('fl-pending');entry.target.classList.add('fl-in-view');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -30px 0px'});
   document.querySelectorAll('.fl-section .fl-intro,.fl-section-heading,.fl-split>.fl-col,.fl-step,.fl-reveal,.fl-page-intro').forEach(node=>{
    if(node.closest('.fl-reveal')!==null&&!node.classList.contains('fl-reveal'))return;
    node.classList.add('fl-observed');
    const siblings=[...node.parentElement.children];node.style.setProperty('--fl-stagger',Math.min(siblings.indexOf(node),3)*85+'ms');
    if(node.getBoundingClientRect().top>innerHeight-30){node.classList.add('fl-pending');observer.observe(node);}
   });
  }
  let scheduled=false;
  const renderScroll=()=>{
   const top=scrollY,total=document.documentElement.scrollHeight-innerHeight;
   progress.style.transform=`scaleX(${total>0?Math.min(1,top/total):0})`;
   header?.classList.toggle('fl-header-scrolled',top>24);
   if(hero&&!paused&&!preference.matches&&matchMedia('(min-width: 821px)').matches&&top<hero.offsetHeight+150)hero.style.setProperty('--fl-parallax',Math.min(55,top*.075)+'px');
   scheduled=false;
  };
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(renderScroll);}},{passive:true});addEventListener('resize',renderScroll,{passive:true});renderScroll();
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.fl-service-card,.fl-project-card,.fl-form-panel').forEach(card=>{
   let frame=0;
   card.addEventListener('pointermove',event=>{if(!finePointer.matches||paused||preference.matches||frame)return;frame=requestAnimationFrame(()=>{const box=card.getBoundingClientRect();card.style.setProperty('--fl-light-x',((event.clientX-box.left)/box.width*100).toFixed(1)+'%');card.style.setProperty('--fl-light-y',((event.clientY-box.top)/box.height*100).toFixed(1)+'%');frame=0;});},{passive:true});
  });
 }
 const status=document.querySelector('.fl-alert');if(status&&location.search.includes('enquiry=')){status.focus();status.scrollIntoView({block:'center',behavior:'auto'});}
});
