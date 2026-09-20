'use strict';

for (const form of document.querySelectorAll('.card')) {
  const submit = form.querySelector('.submit');
  const buttonText = form.querySelector('.button-text');
  const success = form.querySelector('.success');
  const actions = form.querySelector('.actions');
  const cancel = form.querySelector('.cancel');
  const replay = form.querySelector('.replay');
  const description = form.elements.description;
  const counter = form.querySelector('.counter');
  const fileInput = form.elements.screenshot;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'idle';
  let pending = null;
  let reveal = null;
  let generation = 0;

  function setState(next) {
    state = next;
    form.dataset.state = state;
    form.setAttribute('aria-busy', String(state === 'loading'));
    submit.disabled = state === 'loading';
    buttonText.textContent = state === 'loading' ? 'Submitting...' : 'Submit Bug';
    success.hidden = state !== 'success';
    actions.hidden = state === 'idle';
    cancel.hidden = state !== 'loading';
    replay.hidden = state !== 'success';
  }

  function stop() {
    generation++;
    clearTimeout(pending);
    pending = null;
    reveal?.cancel();
    reveal = null;
    setState('idle');
  }

  function showFile() {
    if (!fileInput) return;
    const file = fileInput.files[0];
    form.querySelector('.file-name').textContent = file ? file.name : 'Attach Screenshot';
    form.querySelector('.file-hint').textContent = file ? 'Screenshot attached' : 'Click to upload image';
    form.querySelector('.remove-file').hidden = !file;
  }

  form.addEventListener('input', (event) => {
    if (event.target.matches('input[type=file]')) return;
    if (state !== 'idle') stop();
    if (counter) counter.textContent = `${description.value.length}/200`;
  });

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      stop();
      const file = fileInput.files[0];
      const error = form.querySelector('.file-error');
      const invalid = file && (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024);
      error.hidden = !invalid;
      error.textContent = invalid ? 'Choose a PNG, JPG, WebP or GIF image under 10 MB.' : '';
      if (invalid) fileInput.value = '';
      showFile();
    });
    form.querySelector('.remove-file').addEventListener('click', () => {
      stop();
      fileInput.value = '';
      showFile();
      fileInput.focus();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state === 'loading') return;
    for (const input of [form.elements.title, description]) {
      if (!input.value.trim()) {
        input.setCustomValidity('Please describe the bug.');
        input.reportValidity();
        input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
        return;
      }
    }
    stop();
    const run = generation;
    setState('loading');
    // A deliberate simulated request delay, independent of the decorative spinner.
    pending = setTimeout(() => {
      if (generation !== run) return;
      setState('success');
      if (!reduceMotion.matches) {
        reveal = success.animate([
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 240, easing: 'ease-out' });
      }
    }, reduceMotion.matches ? 150 : 1200);
  });

  cancel.addEventListener('click', () => { stop(); submit.focus(); });
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state === 'loading') {
      stop();
      submit.focus();
    }
  });
  form.addEventListener('reset', () => {
    stop();
    for (const input of [form.elements.title, description]) input.setCustomValidity('');
    queueMicrotask(() => {
      if (counter) counter.textContent = '0/200';
      if (fileInput) { form.querySelector('.file-error').hidden = true; showFile(); }
      form.elements.title.focus();
    });
  });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) reveal?.cancel(); });
  setState('idle');
}
