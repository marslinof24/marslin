// Tiny browser test harness. Tests load real pages in a same-origin iframe and
// write "PASS name" / "FAIL name: detail" lines into <pre id="results">.
// run.ps1 runs each page with headless Chrome --dump-dom and greps those lines.
(() => {
  const out = document.getElementById('results');
  let failures = 0;

  const line = (text) => { out.textContent += text + '\n'; };
  const check = (ok, name, detail = '') => {
    if (!ok) failures += 1;
    line(`${ok ? 'PASS' : 'FAIL'} ${name}${!ok && detail ? `: ${detail}` : ''}`);
    return ok;
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Loads url into a fresh iframe and resolves with it after the load event
  // plus a short settle so deferred scripts have run.
  const loadFrame = (url, { settle = 150, before } = {}) => new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'width:1200px;height:900px;border:0';
    const timer = setTimeout(() => reject(new Error(`timed out loading ${url}`)), 8000);
    frame.addEventListener('load', async () => {
      clearTimeout(timer);
      await wait(settle);
      resolve(frame);
    }, { once: true });
    if (before) before();
    frame.src = url;
    document.getElementById('stage').append(frame);
  });

  const run = async (name, body) => {
    try {
      await body();
    } catch (error) {
      check(false, name, error && error.message ? error.message : String(error));
    }
    line(failures ? `DONE ${failures} failed` : 'DONE all passed');
  };

  window.T = { check, line, wait, loadFrame, run };
})();
