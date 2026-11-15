// Exercise the real Welcome document, including the subsequent header click.
(() => {
  const frame=document.querySelector('iframe'),output=document.querySelector('#result');
  const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  async function until(predicate,timeout=9000){const start=performance.now();while(!predicate()){if(performance.now()-start>timeout)throw Error('Timed out');await tick();}}
  async function open(){await new Promise(resolve=>{frame.onload=resolve;frame.src='../index.html?welcome-test='+Date.now()});await frame.contentDocument.fonts.ready;}
  document.querySelector('#run').onclick=async()=>{
    output.removeAttribute('data-finished');const results=[];
    try{
      for(const page of ['home.html','portfolio.html','workspace.html','about.html#links']){
        await open();let doc=frame.contentDocument;
        doc.querySelector(`.welcome-navigation a[href="${page}"]`).click();
        await until(()=>frame.contentWindow.location.pathname.endsWith('/'+page.split('#')[0])&&!doc.querySelector('.site-arrival'));
        const contact=page.includes('#')?frame.contentWindow.scrollY>0:true;
        doc.querySelector('#site-nav a[href="workspace.html"]').click();
        if(!doc.querySelector('main'))throw Error('Post-Welcome header navigation cleared the document');
        await until(()=>frame.contentWindow.location.pathname.endsWith('/workspace.html')&&doc.querySelector('main'));
        await until(()=>!doc.querySelector('.page-layer-outgoing'));
        results.push({entry:page,subsequentNavigation:true,contact});
        if(!contact)throw Error('Contact entry did not reach the contact section');
      }
      await open();const doc=frame.contentDocument;
      doc.querySelector('.welcome-navigation a[href="home.html"]').click();
      await until(()=>doc.querySelector('.site-arrival #site-nav'));
      doc.querySelector('.site-arrival #site-nav a[href="portfolio.html"]').click();
      await until(()=>frame.contentWindow.location.pathname.endsWith('/portfolio.html')&&doc.querySelector('main'));
      await until(()=>!doc.querySelector('.page-layer-outgoing'));
      results.push({midFlightRetarget:true});
      output.textContent=JSON.stringify({pass:true,results},null,2);
    }catch(error){output.textContent=JSON.stringify({pass:false,results,error:String(error)},null,2);}
    output.dataset.finished='true';
  };
})();
