const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');

// Execute the actual non-deferred scripts in the page head, where entry routing
// must run before the Home body is painted. No duplicate copy of the policy.
function openHome(options = {}) {
  const url = new URL(options.url || 'https://marslinof24.github.io/marslin/home.html');
  const redirects = [];
  const location = Object.assign(url, {replace(value) {redirects.push(new URL(value, url).href);}});
  const window = {};
  window.self = window;
  window.top = options.iframe ? {} : window;
  const context = vm.createContext({window,location,URL,document:{referrer:options.referrer || '',documentElement:{style:{}}},
    history:{state:options.state || null},performance:{getEntriesByType:()=>[{type:options.type || 'navigate'}]}});
  const head = fs.readFileSync(path.join(root,'home.html'),'utf8').split('</head>')[0];
  for(const match of head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\b(defer|async)\b/.test(match[1])) continue;
    const src = match[1].match(/\bsrc="([^"]+)"/);
    const code = src ? fs.readFileSync(path.join(root,src[1].split('?')[0]),'utf8') : match[2];
    vm.runInContext(code, context);
  }
  return redirects;
}
test('fresh direct Home URL enters Welcome under the GitHub Pages subpath',()=>{
  assert.deepEqual(openHome(),['https://marslinof24.github.io/marslin/index.html']);
});
test('external links enter Welcome, including a stale history marker',()=>{
  assert.equal(openHome({referrer:'https://example.com/',state:{marsNavigation:'old'}}).length,1);
});
test('root-local and test-site deployments use a relative Welcome path',()=>{
  assert.deepEqual(openHome({url:'http://127.0.0.1:4173/home.html'}),['http://127.0.0.1:4173/index.html']);
  assert.deepEqual(openHome({url:'http://127.0.0.1:4173/test-site/home.html'}),['http://127.0.0.1:4173/test-site/index.html']);
});
test('Welcome native fallback and internal page links still open Home',()=>{
  for(const referrer of ['https://marslinof24.github.io/marslin/','https://marslinof24.github.io/marslin/index.html','https://marslinof24.github.io/marslin/workspace.html'])
    assert.deepEqual(openHome({referrer}),[]);
});
test('only verified page history survives reload/back without a new Welcome',()=>{
  for(const type of ['reload','back_forward']) {
    assert.deepEqual(openHome({type,state:{marsNavigation:'verified-page'}}),[]);
    assert.equal(openHome({type}).length,1);
  }
});
test('editor iframe and file preview remain accessible',()=>{
  assert.deepEqual(openHome({iframe:true}),[]);
  assert.deepEqual(openHome({url:'file:///C:/preview/home.html'}),[]);
});
test('a same-origin page outside this site is still an external entry',()=>{
  assert.equal(openHome({referrer:'https://marslinof24.github.io/another-site/index.html'}).length,1);
});
