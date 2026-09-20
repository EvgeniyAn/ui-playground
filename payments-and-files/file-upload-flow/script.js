(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const files = new Map();
  const MB = 1000000;
  const allowed = /\.(pdf|png|jpe?g|mp4|docx|xlsx|tiff|txt)$/i;
  let nextId = 0;
  let frame = 0;
  let lastTime = 0;
  let dragDepth = 0;
  const announce = message => { $('announcement').textContent = message; };
  const size = bytes => `${(bytes / MB).toFixed(1)} MB`;
  function validation(file) {
    if (!allowed.test(file.name)) return 'Unsupported type · choose a supported file';
    if (file.size > 50 * MB) return 'Too large · choose a file under 50 MB';
    return '';
  }
  function setState(file, state, message) {
    file.state = state;
    file.message = message;
    file.row.dataset.state = state;
    file.action.textContent = state === 'uploading' ? '×' : state === 'done' ? '✓' : file.invalid ? 'Replace' : 'Retry';
    file.action.disabled = state === 'done';
    file.action.setAttribute('aria-label', `${state === 'uploading' ? 'Cancel' : state === 'done' ? 'Uploaded' : file.invalid ? 'Replace' : 'Retry'} ${file.name}`);
    if (state !== 'uploading') announce(`${file.name}: ${message}`);
    paint(file);
  }
  function paint(file) {
    const percent = Math.floor(file.progress * 100);
    file.bar.style.width = `${percent}%`;
    file.meter.setAttribute('aria-valuenow', percent);
    file.percent.textContent = file.state === 'uploading' ? `${percent}%` : file.message;
    file.detail.textContent = file.state === 'uploading' ? `${size(file.size * file.progress)} of ${size(file.size)} · ${size(file.speed)}/s` : file.state === 'done' ? size(file.size) : '0 bytes sent to a server';
  }
  function summary() {
    const all = [...files.values()];
    const active = all.filter(f => f.state === 'uploading');
    const done = all.filter(f => f.state === 'done').length;
    const failed = all.filter(f => f.state === 'error').length;
    $('count').textContent = all.length;
    $('summary').textContent = all.length ? `${done} uploaded${active.length ? ` · ${active.length} uploading` : ''}${failed ? ` · ${failed} need attention` : ''}${all.some(f => f.state === 'cancelled') ? ' · cancelled files can retry' : ''}` : 'Ready when you are';
    $('tray').hidden = !all.length;
    $('tray-title').textContent = active.length ? `Uploading ${active.length} ${active.length === 1 ? 'file' : 'files'}` : failed ? 'Uploads need attention' : 'Uploads finished';
    const total = all.reduce((sum, f) => sum + f.size, 0);
    const transferred = all.reduce((sum, f) => sum + f.size * f.progress, 0);
    $('tray-bar').style.width = `${total ? transferred / total * 100 : 0}%`;
    $('tray-status').textContent = $('summary').textContent;
    $('clear').disabled = !all.some(f => f.state !== 'uploading');
  }
  function tick(time) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .1) : 0;
    lastTime = time;
    for (const file of files.values()) {
      if (file.state !== 'uploading') continue;
      file.progress = Math.min(1, file.progress + delta * file.speed / Math.max(file.size, 1));
      if (file.failOnce && file.progress >= .57) {
        file.failOnce = false;
        setState(file, 'error', 'Connection interrupted');
      } else if (file.progress >= 1) setState(file, 'done', '✓ Uploaded');
      else paint(file);
    }
    summary();
    if ([...files.values()].some(f => f.state === 'uploading')) frame = requestAnimationFrame(tick);
    else { frame = 0; lastTime = 0; }
  }
  function start() { if (!frame) frame = requestAnimationFrame(tick); }
  function add(input) {
    if (!files.size) $('files').replaceChildren();
    for (const source of input) {
      const file = { id: ++nextId, name: source.name, size: source.size, progress: 0, speed: Math.max(source.size / (5 + nextId % 4), .1 * MB), failOnce: !!source.failOnce };
      file.invalid = validation(file);
      file.row = document.createElement('article');
      file.row.className = 'file';
      file.row.innerHTML = '<span class="file-icon" aria-hidden="true"></span><div class="file-main"><div class="file-name"></div><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div><div class="file-meta"><span class="file-percent"></span><span class="file-detail"></span></div></div><button class="file-action"></button>';
      file.row.querySelector('.file-icon').textContent = file.name.split('.').pop().slice(0, 4).toUpperCase();
      file.row.querySelector('.file-name').textContent = file.name;
      file.meter = file.row.querySelector('.progress');
      file.meter.setAttribute('aria-label', file.name);
      file.bar = file.meter.firstElementChild;
      file.percent = file.row.querySelector('.file-percent');
      file.detail = file.row.querySelector('.file-detail');
      file.action = file.row.querySelector('.file-action');
      file.action.addEventListener('click', () => {
        if (file.state === 'uploading') setState(file, 'cancelled', 'Cancelled');
        else if (file.invalid) {
          const replacement = document.createElement('input');
          replacement.type = 'file';
          replacement.accept = $('file-input').accept;
          replacement.addEventListener('change', () => {
            if (!replacement.files.length) return;
            const replacementFile = replacement.files[0];
            const error = validation(replacementFile);
            if (error) { announce(error); setState(file, 'error', error); return; }
            files.delete(file.id); file.row.remove(); add([replacementFile]);
          }, { once: true });
          replacement.click();
        } else if (file.state !== 'done') { file.progress = 0; setState(file, 'uploading', ''); start(); }
        summary();
      });
      files.set(file.id, file);
      $('files').append(file.row);
      setState(file, file.invalid ? 'error' : 'uploading', file.invalid);
    }
    summary(); start();
  }
  function empty() {
    $('files').innerHTML = '<div class="empty">Your files will appear here.<span>Drop, browse, or paste a file anywhere in this window.</span></div>';
  }
  $('drop-zone').addEventListener('click', () => $('file-input').click());
  $('file-input').addEventListener('change', event => { add([...event.target.files]); event.target.value = ''; });
  document.addEventListener('dragover', event => event.preventDefault());
  document.addEventListener('drop', event => { event.preventDefault(); dragDepth = 0; $('drop-zone').classList.remove('drag-over'); });
  $('drop-zone').addEventListener('dragenter', event => { event.preventDefault(); dragDepth++; $('drop-zone').classList.add('drag-over'); });
  $('drop-zone').addEventListener('dragleave', () => { if (--dragDepth <= 0) $('drop-zone').classList.remove('drag-over'); });
  $('drop-zone').addEventListener('drop', event => add([...event.dataTransfer.files]));
  document.addEventListener('paste', event => { if (event.clipboardData.files.length) { event.preventDefault(); add([...event.clipboardData.files]); } });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { for (const file of files.values()) if (file.state === 'uploading') setState(file, 'cancelled', 'Cancelled'); summary(); } });
  $('clear').addEventListener('click', () => { for (const file of files.values()) if (file.state !== 'uploading') { file.row.remove(); files.delete(file.id); } if (!files.size) empty(); summary(); });
  $('replay').addEventListener('click', () => {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    files.clear(); $('files').replaceChildren();
    add([{ name: 'keynote-final.mp4', size: 48.2 * MB }, { name: 'deck.pdf', size: 4.2 * MB }, { name: 'cover-art.psd', size: 12 * MB }, { name: 'logo.png', size: .3 * MB, failOnce: true }, { name: 'raw-scan.tiff', size: 61 * MB }]);
    $('replay').innerHTML = '<span aria-hidden="true">↻</span> Replay demo';
  });
  $('collapse').addEventListener('click', () => { const expanded = $('collapse').getAttribute('aria-expanded') === 'true'; $('collapse').setAttribute('aria-expanded', String(!expanded)); $('collapse').setAttribute('aria-label', `${expanded ? 'Expand' : 'Collapse'} upload activity`); $('collapse').textContent = expanded ? '+' : '−'; $('tray-detail').hidden = expanded; });
  summary();
})();
