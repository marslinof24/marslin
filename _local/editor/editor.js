(() => {
  const $ = selector => document.querySelector(selector);
  const frame = $('#preview');
  let draft, token, selected, dirty = false, editing = true, busy = false;
  let history = [];
  let removing;
  const labels = {text:'文字',link:'文字與連結',image:'圖片'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function status(text, error = false) {
    $('#status').textContent = text;
    $('#status').style.color = error ? '#8b3a2e' : '';
  }
  async function request(path, body, raw = false) {
    const options = body === undefined ? {} : {method:'POST',headers:{'X-Editor-Token':token,'Content-Type':raw ? 'application/octet-stream' : 'application/json'},body:raw ? body : JSON.stringify(body)};
    const response = await fetch(path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '儲存失敗，請稍後重試。');
    return data;
  }
  function tell(data) { frame.contentWindow?.postMessage({source:'mars-editor',...data},location.origin); }
  function sync() { tell({type:'state',fields:draft.fields,editing}); }
  function checkpoint() {
    history.push(JSON.stringify(draft));
    if (history.length > 40) history.shift();
    $('#undo').disabled = false;
  }
  function changed() {
    dirty = true; status('有尚未儲存的修改'); sync(); drawFields(); drawItems();
  }
  function update(key, property, value) {
    const field = draft.fields[key];
    if (!field || field[property] === value) return;
    checkpoint(); field[property] = value; changed();
  }
  function select(key) {
    if (!draft.fields[key]) return;
    selected = key;
    const field = draft.fields[key];
    const node = frame.contentDocument?.querySelector(`[data-field="${CSS.escape(key)}"]`);
    const related = node?.closest('a[data-field],.personal-social-pending[data-field]');
    const linkKey = 'href' in field ? key : related?.dataset.field;
    const linkField = draft.fields[linkKey];
    let markup = `<span class="selection-kind">${labels[field.kind]}</span><h2>${esc(field.label || '內容')}</h2>`;
    if ('text' in field) markup += `<label for="field-text">顯示文字</label><textarea id="field-text">${esc(field.text)}</textarea>`;
    if (linkField && 'href' in linkField) markup += `<label for="field-href">連結網址</label><input type="text" id="field-href" value="${esc(linkField.href)}" placeholder="https://… 或 about.html#links">`;
    if (field.kind === 'image') markup += `${field.src ? `<img class="image-preview" src="/preview/${esc(field.src)}" alt="目前圖片">` : '<p class="field-note">這裡尚未放入圖片。</p>'}<div class="image-actions"><button id="upload">選擇圖片</button></div><label for="field-alt">圖片說明（替代文字）</label><input id="field-alt" type="text" value="${esc(field.alt)}"><p class="field-note">PNG、JPG、WebP，最大 12MB。圖片會留在本機草稿，套用前不會修改正式站。</p>`;
    if (!('text' in field) && field.kind === 'link') markup += '<p class="field-note">要修改標籤文字，可直接點選連結內的文字。</p>';
    $('#selection').innerHTML = markup;
    for (const property of ['text','href','alt']) $(`#field-${property}`)?.addEventListener('input',event => update(property==='href'?linkKey:key,property,event.target.value));
    $('#upload')?.addEventListener('click',() => $('#image-file').click());
    tell({type:'select',key});
  }
  function drawFields() {
    const search = $('#search').value.toLowerCase();
    const page = $('#page').value;
    const prefix = page + ':';
    const projectIds = draft.projects.filter(id=>id!=='base');
    const fields = Object.entries(draft.fields).filter(([key,field]) => {
      const match = key.startsWith(prefix) || key.startsWith('shared:') || page==='portfolio.html' && projectIds.some(id=>key.startsWith(id+'|')) || page==='workspace.html' && key.startsWith('capture:') && draft.captures.some(id=>key.startsWith('capture:'+id+':'));
      return match && `${field.label} ${field.text || ''} ${field.href || ''}`.toLowerCase().includes(search);
    });
    $('#field-list').innerHTML = fields.map(([key,field])=>`<button class="field-choice" data-field-choice="${esc(key)}">${labels[field.kind]} · ${esc(field.text || field.label || field.href || '圖片')}</button>`).join('');
  }
  function projectFields(id) {
    const keys = [...frame.contentDocument.querySelectorAll('[data-project]')].find(el=>el.dataset.project===id)?.querySelectorAll('[data-field]');
    return keys ? [...keys].map(el=>el.dataset.field) : [];
  }
  function drawItems() {
    if (!draft) return;
    const page = $('#page').value;
    const collection = page==='workspace.html'?'captures':page==='portfolio.html'?'projects':null;
    $('#collections').hidden = !collection;
    if (!collection) return;
    $('#collection-heading').textContent = collection==='captures'?'工作台項目':'專案';
    $('#items').innerHTML = draft[collection].map((id,index) => {
      let name;
      if (collection==='captures') name = draft.fields[`capture:${id}:title`].text;
      else {
        const element = [...(frame.contentDocument?.querySelectorAll('[data-project]') || [])].find(n=>n.dataset.project===id)?.querySelector('.project-title');
        name = element ? draft.fields[element.dataset.field]?.text : '專案 '+(index+1);
      }
      return `<div class="item"><button data-open-item="${esc(id)}">${esc(name || '未命名項目')}</button><button data-delete-item="${esc(id)}" aria-label="刪除${esc(name || '項目')}">刪除</button></div>`;
    }).join('');
  }
  function loadPage() {
    const page = $('#page').value;
    selected = null;
    $('#selection').innerHTML = '<div class="empty"><span class="point">↖</span><h1>點選畫面，開始編輯。</h1><p>點文字或圖片區，在這裡修改；雙擊文字也能直接輸入。</p></div>';
    $('#page-title').textContent = $('#page option:checked').textContent;
    frame.src = '/preview/'+page+(page==='index.html' && editing?'#destinations':'');
    drawFields();
  }
  async function save() {
    if (busy) return false;
    busy = true; $('#save').disabled = true; status('正在儲存…');
    try {
      const data = await request('/api/save',draft);
      draft = data.draft; dirty = false;
      status(`已儲存 · 草稿 ${draft.revision}`);
      return true;
    } catch(error) { status(error.message,true); return false; }
    finally { busy = false; $('#save').disabled = false; }
  }
  async function itemAction(action, id) {
    if (dirty && !await save()) return;
    if (busy) return;
    busy = true;
    const collection = $('#page').value==='workspace.html'?'captures':'projects';
    try {
      const data = await request('/api/item',{revision:draft.revision,collection,action,id});
      draft=data.draft; history=[]; $('#undo').disabled=true; selected=null;
      status(`已儲存 · 草稿 ${draft.revision}`); loadPage();
    } catch(error) { status(error.message,true); }
    finally { busy=false; }
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==frame.contentWindow || event.data?.source!=='mars-preview') return;
    const data=event.data;
    if(data.type==='ready') {
      if (data.page && [...$('#page').options].some(o=>o.value===data.page)) $('#page').value=data.page;
      $('#page-title').textContent=$('#page option:checked').textContent;
      sync(); drawFields(); drawItems();
    }
    if(data.type==='select') select(data.key);
    if(data.type==='text') {update(data.key,'text',data.text); if(selected===data.key && $('#field-text')) $('#field-text').value=data.text;}
    if(data.type==='save') save();
  });
  $('#page').addEventListener('change',loadPage);
  $('#save').addEventListener('click',save);
  $('#mode').addEventListener('click',()=>{
    editing=!editing; document.body.classList.toggle('is-preview',!editing);
    $('#mode').textContent=editing?'切換預覽':'返回編輯'; $('#mode').setAttribute('aria-pressed',String(editing));
    $('#hint').textContent=editing?'編輯模式：點選內容不會跳轉':'預覽模式：可操作動畫、導覽與連結';
    if($('#page').value==='index.html')loadPage();else sync();
  });
  $('#undo').addEventListener('click',()=>{
    if(!history.length) return;
    const revision=draft.revision; draft=JSON.parse(history.pop()); draft.revision=revision;
    $('#undo').disabled=!history.length; changed(); if(selected) select(selected);
  });
  $('#search').addEventListener('input',drawFields);
  $('#field-list').addEventListener('click',event=>{const key=event.target.closest('[data-field-choice]')?.dataset.fieldChoice;if(key) select(key);});
  $('#add').addEventListener('click',()=>itemAction('add'));
  $('#items').addEventListener('click',event=>{
    const open=event.target.closest('[data-open-item]')?.dataset.openItem;
    const remove=event.target.closest('[data-delete-item]')?.dataset.deleteItem;
    if(open){
      if($('#page').value==='workspace.html'){tell({type:'capture',id:open});select(`capture:${open}:title`);}
      else {const key=projectFields(open).find(key=>draft.fields[key]?.text && frame.contentDocument.querySelector(`[data-field="${CSS.escape(key)}"]`)?.classList.contains('project-title')); if(key)select(key);}
    }
    if(remove){removing=remove;$('#remove-dialog').showModal();}
  });
  $('#cancel-remove').addEventListener('click',()=>$('#remove-dialog').close());
  $('#confirm-remove').addEventListener('click',()=>{$('#remove-dialog').close();itemAction('delete',removing);});
  $('#image-file').addEventListener('change',async event=>{
    const file=event.target.files[0],key=selected; if(!file || !key) return;
    if(file.size>12*1024*1024){status('圖片需小於 12MB。',true);return;}
    status('正在加入圖片…');
    try {const data=await request('/api/upload',file,true);update(key,'src',data.src);select(key);}
    catch(error){status(error.message,true);} finally{event.target.value='';}
  });
  document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{
    frame.style.width=button.dataset.width==='desktop'?'100%':'390px';frame.style.maxWidth='100%';
    document.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();save();}});
  request('/api/state').then(data=>{draft=data.draft;token=data.token;status(`已載入 · 草稿 ${draft.revision}`);loadPage();}).catch(error=>status(error.message,true));
})();
