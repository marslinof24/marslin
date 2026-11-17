// Throwaway local study: carousel behavior and restrained, browser-rendered motion.
(() => {
  const root=document.querySelector('.course-carousel');
  if(!root)return;
  const track=root.querySelector('.course-track'),windowEl=root.querySelector('.course-window');
  const slides=[...root.querySelectorAll('.course-slide')],dots=[...root.querySelectorAll('[data-course-index]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const initial=['data','git','linux'].indexOf(new URL(location.href).searchParams.get('exercise')||location.hash.slice(1));
  let current=initial<0?0:initial,start,dragged=false,resizeFrame;
  function place(animate=true){
    track.style.transition=animate&&!reduced.matches?'':'none';
    const slide=slides[current];
    track.style.transform=`translateX(${(windowEl.clientWidth-slide.offsetWidth)/2-slide.offsetLeft+slides[0].offsetLeft}px)`;
  }
  function select(index,update=true){
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-current',i===current);slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current));});
    dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
    root.querySelector('.course-status').textContent=`${slides[current].dataset.title} · ${current+1} of ${slides.length}`;
    if(update){const url=new URL(location.href);url.searchParams.set('exercise',slides[current].dataset.exercise);url.hash='coursework';history.replaceState(history.state,'',url);}
    place(update);
  }
  root.querySelector('[data-course-prev]').addEventListener('click',()=>select(current-1));
  root.querySelector('[data-course-next]').addEventListener('click',()=>select(current+1));
  dots.forEach(dot=>dot.addEventListener('click',()=>select(Number(dot.dataset.courseIndex))));
  root.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable=true]'))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const forward=event.key==='ArrowRight';select(current+(forward?1:-1));if(event.target.closest('.course-slide'))root.querySelector(forward?'[data-course-next]':'[data-course-prev]').focus({preventScroll:true});}
  });
  windowEl.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0){start={x:event.clientX,y:event.clientY};dragged=false;}});
  windowEl.addEventListener('pointerup',event=>{
    if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=undefined;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){dragged=true;select(current+(dx<0?1:-1));}
  });
  windowEl.addEventListener('pointercancel',()=>{start=undefined;dragged=false;});
  windowEl.addEventListener('dragstart',event=>event.preventDefault());
  windowEl.addEventListener('click',event=>{if(dragged){event.preventDefault();dragged=false;}},true);
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>place(false));}).observe(windowEl);
  addEventListener('hashchange',()=>{const i=slides.findIndex(s=>s.dataset.exercise===(new URL(location.href).searchParams.get('exercise')||location.hash.slice(1)));if(i>=0)select(i,false);});
  addEventListener('pointerup',()=>{start=undefined;});
  select(current,false);

  // Reveal once, without scroll hijacking, timers, or a continuous render loop.
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.motion-intro,.workspace-solution,.workspace-bench').forEach(el=>observer.observe(el));
  document.body.classList.add('motion-ready');
  const mark=document.querySelector('.motion-mark'),object=mark.querySelector('.motion-mark-object');
  mark.querySelectorAll('img').forEach(img=>{const span=document.createElement('span');span.className=img.className;img.replaceWith(span);});
  mark.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType!=='mouse')return;
    const rect=mark.getBoundingClientRect();
    object.style.setProperty('--mark-x',`${-8-(event.clientY-rect.top-rect.height/2)/rect.height*8}deg`);
    object.style.setProperty('--mark-y',`${-14+(event.clientX-rect.left-rect.width/2)/rect.width*12}deg`);
  });
  mark.addEventListener('pointerleave',()=>{object.style.removeProperty('--mark-x');object.style.removeProperty('--mark-y');});
})();
