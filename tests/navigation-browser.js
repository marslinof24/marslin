// Browser regression harness: loads the real static pages and router, no mocks.
(() => {
  const frame=document.querySelector('iframe'),output=document.querySelector('#result');
  const width=Number(new URL(location.href).searchParams.get('width'));
  if(width>=320&&width<=1920)frame.style.width=width+'px';
  const next=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  async function waitFor(predicate,timeout=8000){const start=performance.now();while(!predicate()){if(performance.now()-start>timeout)throw Error('Timed out waiting for the real page');await next();}}
  function snapshot(){
    const win=frame.contentWindow,doc=frame.contentDocument;
    const header=doc.querySelector('.site-header');
    const mains=[...doc.querySelectorAll('.page-stack main')].map(main=>{
      let opacity=1,node=main;
      while(node&&node!==doc.body){opacity*=Number(win.getComputedStyle(node).opacity);node=node.parentElement;}
      const rect=main.getBoundingClientRect();
      return {title:main.querySelector('h1')?.textContent,opacity,top:rect.top,width:rect.width};
    });
    return {time:performance.now(),path:win.location.pathname,scroll:win.scrollY,headerTop:header?.getBoundingClientRect().top,cursor:doc.body&&win.getComputedStyle(doc.body).cursor,mains};
  }
  async function capture(ms){const frames=[],until=performance.now()+ms;do{frames.push(snapshot());await next();}while(performance.now()<until);return frames;}
  document.querySelector('#run').onclick=async()=>{
    const results=[],failures=[];
    output.textContent='Running';output.removeAttribute('data-finished');
    try{
      await waitFor(()=>frame.contentDocument?.querySelector('#site-nav')&&frame.contentDocument.readyState==='complete');
      await frame.contentDocument.fonts.ready;
      for(const page of ['portfolio.html','about.html','workspace.html','home.html']){
        frame.contentDocument.querySelector(`#site-nav a[href="${page}"]`).click();
        const frames=await capture(650);
        const overlap=frames.filter(f=>f.mains.filter(m=>m.opacity>.12).length>1);
        const arrived=frames.filter(f=>f.path.endsWith('/'+page));
        const scrolls=arrived.map(f=>f.scroll),headers=frames.map(f=>f.headerTop).filter(Number.isFinite);
        const entry={page,frames:frames.length,overlapFrames:overlap.length,scrollRange:scrolls.length?Math.max(...scrolls)-Math.min(...scrolls):null,headerRange:headers.length?Math.max(...headers)-Math.min(...headers):null,cursorChanges:new Set(frames.map(f=>f.cursor)).size};
        results.push(entry);
        if(overlap.length)failures.push(`${page}: old and new text overlap in ${overlap.length} frames`);
        if(entry.scrollRange>1)failures.push(`${page}: scroll jumps ${entry.scrollRange}px`);
        if(entry.headerRange>1)failures.push(`${page}: header jumps ${entry.headerRange}px`);
        if(entry.cursorChanges!==1)failures.push(`${page}: cursor changes during transition`);
      }
      // Redirect before the old fade completes; final choice must win and clean up.
      for(const page of ['about.html','portfolio.html','workspace.html']){
        frame.contentDocument.querySelector(`#site-nav a[href="${page}"]`).click();
        await capture(45);
      }
      const rapid=await capture(700),doc=frame.contentDocument;
      if(!frame.contentWindow.location.pathname.endsWith('/workspace.html')||doc.querySelectorAll('main').length!==1||doc.querySelectorAll('.page-stack>.page-layer').length!==1)failures.push('Rapid selection did not settle to one Workspace page');
      if(rapid.some(f=>f.mains.filter(m=>m.opacity>.12).length>1))failures.push('Rapid selection creates readable overlap');
      frame.contentDocument.querySelector('#site-nav a[href="home.html"]').click();
      await capture(45);
      const during=snapshot();
      frame.contentDocument.querySelector('#site-nav a[href="home.html"]').click();
      const repeated=snapshot();
      if(during.mains.length>1&&repeated.mains.length===1&&repeated.mains[0].opacity>.99)failures.push('Repeating the selected link snaps an unfinished transition to its end');
      await capture(500);
      output.textContent=JSON.stringify({pass:failures.length===0,results,failures},null,2);
    }catch(error){output.textContent=JSON.stringify({pass:false,results,failures:[String(error)]},null,2);}
    output.dataset.finished='true';
  };
})();
