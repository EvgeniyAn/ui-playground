(() => {
  'use strict';
  const root = document.querySelector('.share');
  const trigger = root.querySelector('.trigger');
  const label = root.querySelector('.label');
  const close = root.querySelector('.close');
  const group = root.querySelector('.channels');
  const status = root.querySelector('.status');
  const replay = root.querySelector('.replay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // A public reference URL is useful when this demo is opened as a local file.
  const shareURL = 'https://www.instagram.com/reel/DdcMKv9z9-T/';
  const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const icons = {
    x: svg('<path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z"/>'),
    linkedin: svg('<path fill="currentColor" d="M3 8h4v13H3V8Zm2-6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 5 2Zm5 6h3.8v1.8c.9-1.4 2.1-2.1 3.8-2.1 4 0 4.4 2.5 4.4 5.7V21h-4v-6.7c0-1.6-.1-3.4-2.1-3.4s-2.1 1.7-2.1 3.3V21H10V8Z"/>'),
    whatsapp: svg('<path d="M20.5 11.6a8.5 8.5 0 0 1-12.7 7.5L3 20.4l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="currentColor" d="M8.4 6.8c-.4-.1-.8.1-1 .6-.7 1.4.1 3.3 2 5.3 2 2 4.3 3 5.9 2.3.7-.4 1-1 1-1.6 0-.3-2.1-1.4-2.4-1.3l-.9 1c-1.4-.4-3-1.8-3.6-3.1l.7-1c.2-.3-.8-2.2-1.1-2.2h-.6Z"/>'),
    email: svg('<rect x="2" y="4" width="20" height="16" rx="3" fill="currentColor"/><path d="m2 7 10 6 10-6" fill="none" stroke="white" stroke-width="1.8"/>'),
    link: svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m10 13 4-4M8.7 15.3a4 4 0 0 0 5.6 0l4-4a4 4 0 0 0-5.6-5.6L11 7.4"/><path d="M15.3 8.7a4 4 0 0 0-5.6 0l-4 4a4 4 0 0 0 5.6 5.6l1.7-1.7"/></g>')
  };
  const check = svg('<path d="m6 12 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
  const channels = [
    ['x', 'Share on X', '#202326'], ['linkedin', 'Share on LinkedIn', '#0869ac'],
    ['whatsapp', 'Share on WhatsApp', '#13824d'], ['email', 'Share by email', '#c7354e'],
    ['link', 'Copy link', '#404e74']
  ];
  const items = channels.map(([name, title, color], i) => {
    const button = document.createElement('button');
    button.className = 'channel';
    button.setAttribute('aria-label', title);
    button.style.setProperty('--brand', color);
    button.innerHTML = `<span class="glyph">${icons[name]}</span><span class="flood">${icons[name]}</span><span class="tick">${check}</span>`;
    group.append(button);
    const angle = (i - 2) * 46 * Math.PI / 180;
    const radius = 60 * 1.5 / (2 * Math.sin(23 * Math.PI / 180));
    return { button, name, x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
  });
  let state = 'idle';
  let generation = 0;
  const animations = new Set();
  const setState = value => { state = value; root.dataset.state = value; };
  async function animate(element, frames, duration = 350, delay = 0) {
    const animation = element.animate(frames, { duration: reduced.matches ? 0 : duration, delay: reduced.matches ? 0 : delay, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' });
    animations.add(animation);
    try { await animation.finished; } catch { /* Reset cancels the current sequence. */ }
    if (animations.has(animation)) {
      animation.commitStyles();
      animation.cancel();
      animations.delete(animation);
    }
  }
  const at = item => `translate(${item.x}px, ${item.y}px) scale(1)`;
  function reset() {
    generation++;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    for (const element of [trigger, label, close, ...group.querySelectorAll('*')]) {
      // Retain only the brand custom property on each channel.
      if (element.classList.contains('channel')) {
        const color = element.style.getPropertyValue('--brand');
        element.removeAttribute('style');
        element.style.setProperty('--brand', color);
        element.disabled = false;
      } else element.removeAttribute('style');
    }
    group.inert = true;
    trigger.disabled = false;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Share');
    status.textContent = '';
    replay.hidden = true;
    setState('idle');
  }
  async function open() {
    if (state !== 'idle') { reset(); return; }
    const token = ++generation;
    setState('opening');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close sharing channels');
    status.textContent = 'Pick a channel';
    await Promise.all([
      animate(label, [{ opacity: 1 }, { opacity: 0 }], 140),
      animate(trigger, [{ width: '180px', marginLeft: '-90px', background: '#fff' }, { width: '68px', marginLeft: '-34px', background: '#bfbba6', boxShadow: 'none' }], 300),
      animate(close, [{ opacity: 0, transform: 'rotate(-90deg)' }, { opacity: 1, transform: 'rotate(0deg)' }], 250, 120)
    ]);
    if (token !== generation) return;
    await Promise.all(items.map((item, i) => {
      item.button.style.visibility = 'visible';
      return animate(item.button, [{ opacity: 0, transform: 'translate(0, 0) scale(.2)' }, { opacity: 1, transform: at(item) }], 390, i * 45);
    }));
    if (token !== generation) return;
    group.inert = false;
    setState('open');
  }
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(shareURL);
      return true;
    } catch {
      const input = document.createElement('textarea');
      input.value = shareURL;
      input.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Report failure honestly. */ }
      input.remove();
      return copied;
    }
  }
  function launch(name) {
    const url = encodeURIComponent(shareURL);
    const targets = {
      x: `https://twitter.com/intent/tweet?url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${url}`,
      email: `mailto:?subject=Take%20a%20look&body=${url}`
    };
    if (name === 'email') location.href = targets[name];
    else window.open(targets[name], '_blank', 'noopener,noreferrer');
  }
  async function choose(item, event) {
    if (state !== 'open') return;
    const token = ++generation;
    setState('selecting');
    const result = item.name === 'link' ? copyLink() : (launch(item.name), Promise.resolve(true));
    const box = item.button.getBoundingClientRect();
    item.button.style.setProperty('--fx', `${event.detail ? (event.clientX - box.left) / box.width * 100 : 50}%`);
    item.button.style.setProperty('--fy', `${event.detail ? (event.clientY - box.top) / box.height * 100 : 50}%`);
    items.forEach(({ button }) => { button.disabled = true; });
    status.textContent = item.name === 'link' ? 'Copying…' : 'Opening…';
    await animate(item.button.querySelector('.flood'), [{ clipPath: 'circle(0% at var(--fx) var(--fy))' }, { clipPath: 'circle(150% at var(--fx) var(--fy))' }], 280);
    if (token !== generation) return;
    await Promise.all([
      animate(trigger, [{ opacity: 1 }, { opacity: 0 }], 180),
      ...items.filter(other => other !== item).map((other, i) => animate(other.button, [{ opacity: 1, transform: at(other) }, { opacity: 0, transform: 'translate(0, 0) scale(.25)' }], 260, i * 25)),
      animate(item.button, [{ transform: at(item) }, { transform: 'translate(0, 0) scale(1.12)' }], 430, 80)
    ]);
    if (token !== generation) return;
    const success = await result;
    if (token !== generation) return;
    await Promise.all([
      animate(item.button.querySelector('.flood'), [{ opacity: 1 }, { opacity: 0 }], 180),
      animate(item.button.querySelector('.glyph'), [{ opacity: 1 }, { opacity: 0 }], 180),
      animate(item.button.querySelector('.tick'), [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], 280)
    ]);
    if (token !== generation) return;
    if (!success) item.button.querySelector('.tick').textContent = '!';
    status.textContent = item.name === 'link' ? (success ? 'Link copied' : 'Could not copy. Please try again.') : 'Ready to share';
    trigger.disabled = true;
    replay.hidden = false;
    setState('done');
    replay.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', open);
  items.forEach(item => item.button.addEventListener('click', event => choose(item, event)));
  replay.addEventListener('click', () => { reset(); trigger.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state !== 'idle') { reset(); trigger.focus(); }
    if (state !== 'open' || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = items.findIndex(item => item.button === document.activeElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (current + (event.key === 'ArrowLeft' ? 4 : 1)) % 5;
    items[index].button.focus();
  });
})();
