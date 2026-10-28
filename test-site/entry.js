// Fresh top-level Home visits start at Welcome. Run synchronously before paint.
(() => {
  if (window.top !== window.self || location.protocol === 'file:') return;
  const current = new URL(location.href);
  if (!current.pathname.endsWith('/home.html')) return;

  const navigation = performance.getEntriesByType('navigation')[0];
  const restoringPage = ['reload', 'back_forward'].includes(navigation?.type)
    && Boolean(history.state?.marsNavigation);
  if (restoringPage) return;

  const directory = new URL('.', current);
  const pages = new Set(['index.html', 'home.html', 'portfolio.html', 'workspace.html', 'about.html']);
  let internal = false;
  try {
    const referrer = new URL(document.referrer);
    const sameDirectory = new URL('.', referrer).pathname === directory.pathname;
    const file = referrer.pathname.split('/').pop() || 'index.html';
    internal = referrer.origin === current.origin && sameDirectory && pages.has(file);
  } catch { /* Empty or external referrers count as a fresh entry. */ }
  if (internal) return;

  const welcome = new URL('index.html', directory);
  welcome.search = current.search;
  // Hide the outgoing Home while its replacement document is being requested.
  document.documentElement.style.visibility = 'hidden';
  try {
    location.replace(welcome.href);
  } catch {
    document.documentElement.style.visibility = '';
  }
})();
