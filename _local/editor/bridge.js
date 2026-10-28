(() => {
  if (window.parent===window) return;
  let fields={},editing=true,selected;
  let observer;
  const send=data=>parent.postMessage({source:'mars-preview',...data},location.origin);
  function markCapture(){
    const id=document.querySelector('[data-capture][aria-pressed=true]')?.dataset.capture;
    const viewer=document.querySelector('#capture-viewer');if(!id||!viewer)return;
    const pairs=[['.capture-frame','image'],['.capture-status','status'],['h2','title'],['.capture-caption>p:not(.capture-status)','description'],['.text-link,.capture-pending','link']];
    for(const [selector,name] of pairs){const node=viewer.querySelector(selector);if(node)node.dataset.field=`capture:${id}:${name}`;}
  }
  function apply(){
    observer?.disconnect();markCapture();
    document.documentElement.classList.toggle('mars-editing',editing);
    if(!editing)document.querySelectorAll('[contenteditable]').forEach(node=>node.removeAttribute('contenteditable'));
    document.querySelectorAll('[data-field]').forEach(node=>{
      const field=fields[node.dataset.field];if(!field)return;
      if('text'in field && node.contentEditable!=='plaintext-only' && node.innerText!==field.text){
        node.replaceChildren(...field.text.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
      }
      if('href' in field && node.classList.contains('personal-social-pending') && field.href){
        const link=document.createElement('a');link.dataset.field=node.dataset.field;link.append(...node.childNodes);link.href=field.href;node.replaceWith(link);
      }
      if('href' in field && node.tagName==='A')node.setAttribute('href',field.href||'#links');
      if(field.kind==='image'&&field.src){
        let img=node.tagName==='IMG'?node:node.querySelector('img');
        if(!img){img=document.createElement('img');node.replaceChildren(img);node.classList.remove('is-placeholder');node.removeAttribute('aria-hidden');}
        if(img.getAttribute('src')!==field.src)img.src=field.src;
        img.alt=field.alt||'';
      }
      if(field.kind==='image'&&!field.src&&node.classList.contains('capture-frame')&&node.querySelector('img')){
        const empty=document.createElement('div');empty.className='capture-empty';
        const icon=document.createElement('span');icon.className='empty-image';icon.setAttribute('aria-hidden','true');
        const label=document.createElement('span');label.textContent='Screenshot to add';
        empty.append(icon,label);node.replaceChildren(empty);node.classList.add('is-placeholder');
      }
      node.toggleAttribute('data-mars-selected',node.dataset.field===selected&&editing);
    });
    observer?.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});
  }
  document.addEventListener('click',event=>{
    if(!editing)return;
    if(event.target.closest('#site-nav,.brand,.menu-toggle,.capture-picker'))return;
    const node=event.target.closest('[data-field]');if(!node)return;
    event.preventDefault();event.stopImmediatePropagation();selected=node.dataset.field;apply();send({type:'select',key:selected});
  },true);
  document.addEventListener('dblclick',event=>{
    if(!editing)return;const node=event.target.closest('[data-field]');if(!node||fields[node.dataset.field]?.kind!=='text')return;
    event.preventDefault();node.contentEditable='plaintext-only';node.focus();
  });
  document.addEventListener('input',event=>{
    const node=event.target.closest('[contenteditable][data-field]');if(node)send({type:'text',key:node.dataset.field,text:node.innerText});
  });
  document.addEventListener('focusout',event=>{if(event.target.hasAttribute('contenteditable'))event.target.removeAttribute('contenteditable');});
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();send({type:'save'});}
    if(event.key==='Escape'){document.activeElement?.blur();selected=null;apply();}
  });
  window.addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='mars-editor')return;
    const data=event.data;
    if(data.type==='state'){fields=data.fields;editing=data.editing;apply();}
    if(data.type==='select'){
      selected=data.key;apply();
      document.querySelector(`[data-field="${CSS.escape(selected)}"]`)?.scrollIntoView({block:'nearest',behavior:'instant'});
    }
    if(data.type==='capture'){
      const button=[...document.querySelectorAll('[data-capture]')].find(n=>n.dataset.capture===data.id);button?.click();apply();
    }
  });
  observer=new MutationObserver(()=>{apply();send({type:'ready',page:location.pathname.split('/').pop()});});
  document.addEventListener('mars:page',()=>{apply();send({type:'ready',page:location.pathname.split('/').pop()});});
  apply();send({type:'ready',page:location.pathname.split('/').pop()});
})();
