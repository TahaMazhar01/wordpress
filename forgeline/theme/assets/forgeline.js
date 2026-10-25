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
 // Contents remain visible without JavaScript and inside the Elementor editor.
 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('elementor-editor-active')){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('fl-pending');observer.unobserve(entry.target);}}),{threshold:.06});
  document.querySelectorAll('.fl-reveal').forEach(node=>{node.classList.add('fl-observed');if(node.getBoundingClientRect().top>innerHeight){node.classList.add('fl-pending');observer.observe(node);}});
 }
 const status=document.querySelector('.fl-alert');if(status&&location.search.includes('enquiry=')){status.focus();status.scrollIntoView({block:'center',behavior:'auto'});}
});
