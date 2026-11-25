// A quiet image viewer: any img[data-view] opens full size in a modal dialog.
// Esc, a click outside the image, or the close button puts it away.
(() => {
  const images = document.querySelectorAll('img[data-view]');
  if (!images.length || !window.HTMLDialogElement) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'viewer';
  dialog.innerHTML = '<figure><img alt=""><figcaption id="viewer-caption"></figcaption></figure><button type="button" class="viewer-close">Close</button>';
  document.body.append(dialog);
  const big = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');

  images.forEach((img) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zoom';
    button.setAttribute('aria-label', `View larger: ${img.alt || 'image'}`);
    img.replaceWith(button);
    button.append(img);
    button.addEventListener('click', () => {
      const text = img.alt;
      big.src = img.currentSrc || img.src;
      caption.textContent = text;
      caption.hidden = !text;
      // The dialog is named by its caption; when the caption repeats the alt,
      // the large image is left unnamed so it is not announced twice.
      if (text) {
        dialog.removeAttribute('aria-label');
        dialog.setAttribute('aria-labelledby', 'viewer-caption');
      } else {
        dialog.removeAttribute('aria-labelledby');
        dialog.setAttribute('aria-label', 'Image');
      }
      big.alt = caption.textContent === text && text ? '' : text;
      dialog.showModal();
    });
  });

  const close = () => dialog.close();
  dialog.querySelector('.viewer-close').addEventListener('click', close);
  // Anywhere but the picture, its caption or the button counts as "outside".
  dialog.addEventListener('click', (event) => { if (!event.target.closest('img, figcaption, .viewer-close')) close(); });
})();
