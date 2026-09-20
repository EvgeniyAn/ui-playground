(() => {
  'use strict';
  const paths = {
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 6 0 0 1 16 0v2Z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 6 0 0 1 14 0v2M16 5a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 5"/>',
    chat: '<path d="M21 11a9 8 0 0 1-9 8H8l-5 3 1-6a8 8 0 0 1-1-5 9 8 0 0 1 18 0Z"/>',
    bag: '<rect x="4" y="6" width="16" height="15" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M8 11c2 3 6 3 8 0"/>',
    cart: '<path d="M2 3h3l3 13h11l3-10H6M8 19h.01M18 19h.01"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    heart: '<path d="M12 21 3 12C-3 4 7-1 12 6c5-7 15-2 9 6Z"/>',
    music: '<path d="M9 18V5l11-3v13M9 9l11-3"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="15" rx="3" ry="3"/>',
    library: '<path d="M4 3v18M8 3v18M12 3v18m4-17 4 16"/>',
    settings: '<path d="m9 3 1-2h4l1 2 3 2 3 1v4l-2 2 2 2v4l-3 1-3 2-1 2h-4l-1-2-3-2-3-1v-4l2-2-2-2V6l3-1Z" transform="translate(1 1) scale(.9)"/><circle cx="12" cy="12" r="3"/>',
    inbox: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 12h5l2 3h4l2-3h5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    pin: '<path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M7 15h3m4 0h3"/>',
    bell: '<path d="M4 18h16l-2-4V9a6 6 0 0 0-12 0v5ZM10 22h4"/>',
    edit: '<path d="M12 4H4v16h16v-8M10 14l1-5 9-8 3 3-9 9Z"/>',
    folder: '<path d="M3 4h7l2 3h9v14H3Z"/>',
    wallet: '<rect x="3" y="3" width="17" height="18" rx="2"/><path d="M3 7h17M15 12h7v5h-7Zm3 2h.01"/>',
    share: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="4" r="3"/><circle cx="19" cy="20" r="3"/><path d="m8 11 8-5M8 14l8 4"/>',
    gift: '<path d="M3 11h18v10H3ZM2 7h20v4H2Zm10 0v14"/><path d="M12 7C1 7 6-3 12 7c6-10 11 0 0 0Z"/>'
  };
  const items = (...names) => names.map(name => [name, name[0].toUpperCase() + name.slice(1)]);
  const basic = items('home','compass','plus','user');
  basic[1][1] = 'Explore'; basic[2][1] = 'Create'; basic[3][1] = 'Profile';
  const social = items('home','compass','chat','users','settings'); social[1][1] = 'Explore';
  const shopping = items('home','bag','cart','search','user'); shopping[4][1] = 'Profile';
  const media = items('search','heart','music','library','settings'); media[1][1] = 'Favorites';
  const definitions = [
    ['liquid','Liquid Floating Bar',basic,0],
    ['magnetic','Magnetic Dock',social,0],
    ['glass','Glass Capsule Dock',shopping,2],
    ['segmented','Segmented Dynamic Bar',social,2],
    ['capsule','Sliding Capsule Dock',items('home','heart','cart','search','plus'),0],
    ['orbit','Orbit Navigation',media,2],
    ['aurora','Aurora Blob Dock',items('inbox','heart','grid','pin','calendar'),2],
    ['wave','Wave Indicator Nav',media,0],
    ['cyber','Cyber Neon Dock',items('compass','heart','music','library','bell'),2],
    ['blob','Morphing Blob Nav',items('home','bell','edit','pin','calendar'),2],
    ['layered','Layered Card Navigation',items('home','folder','wallet','share','gift'),2],
    ['luxury','Minimal Luxury Dock',basic,0]
  ];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const gallery = document.querySelector('.gallery');
  const playButton = document.querySelector('#play');
  const announcement = document.querySelector('#announcement');
  const panels = [];
  let playback = null;

  class Dock {
    constructor(definition, number) {
      const [kind, title, links, initial] = definition;
      this.kind = kind; this.initial = initial; this.index = initial; this.animations = []; this.version = 0;
      const article = document.createElement('article'); article.className = 'study';
      article.innerHTML = `<div class="stage"><nav class="dock ${kind}" aria-label="${title}" style="--count:${links.length}"><div class="indicator" aria-hidden="true"><div class="shape"></div></div>${links.map(([icon,label]) => `<button class="nav-item" type="button" aria-label="${label}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">${paths[icon]}</svg><span>${label}</span></button>`).join('')}</nav></div><h2><span class="number">${String(number + 1).padStart(2,'0')}</span>${title}</h2>`;
      gallery.append(article);
      this.element = article.querySelector('.dock'); this.indicator = article.querySelector('.indicator'); this.buttons = [...article.querySelectorAll('.nav-item')];
      this.buttons.forEach((button,index) => button.addEventListener('click', () => {
        if (this.ignoreClick) return;
        stopPlayback(false); this.select(index); announcement.textContent = `${title}: ${links[index][1]}`;
      }));
      this.element.addEventListener('keydown', event => {
        const current = this.buttons.indexOf(document.activeElement);
        const target = {ArrowRight:(current+1)%links.length, ArrowLeft:(current-1+links.length)%links.length, Home:0, End:links.length-1}[event.key];
        if (target === undefined) return;
        event.preventDefault(); stopPlayback(false); this.buttons[target].focus(); this.select(target);
      });
      this.element.addEventListener('pointerdown', event => { this.pointer = {id:event.pointerId,x:event.clientX,y:event.clientY}; this.ignoreClick = false; });
      this.element.addEventListener('pointerup', event => {
        if (!this.pointer || event.pointerId !== this.pointer.id) return;
        const dx = event.clientX-this.pointer.x, dy = event.clientY-this.pointer.y; this.pointer = null;
        if (Math.abs(dx) < 28 || Math.abs(dx) <= Math.abs(dy)) return;
        this.ignoreClick = true; stopPlayback(false); this.select((this.index + (dx < 0 ? 1 : -1) + links.length)%links.length);
      });
      this.element.addEventListener('pointercancel', () => { this.pointer = null; this.ignoreClick = false; });
      this.element.addEventListener('keydown', () => { this.ignoreClick = false; });
      this.select(initial, false);
    }
    stop() { ++this.version; this.animations.forEach(animation => animation.cancel()); this.animations = []; this.element.dataset.state = 'idle'; }
    async select(index, animate = true) {
      const from = getComputedStyle(this.indicator).transform;
      const previous = this.index;
      this.stop(); const version = this.version; this.index = index;
      this.buttons.forEach((button,i) => {
        button.setAttribute('aria-pressed', String(i === index)); button.tabIndex = i === index ? 0 : -1;
        button.classList.toggle('covered', this.kind === 'capsule' && i >= Math.min(index,2) && i < Math.min(index,2)+3);
      });
      const offset = this.kind === 'capsule' ? Math.min(index,2) / 3 : index;
      this.element.style.setProperty('--index', offset);
      this.element.dataset.active = String(index);
      if (!animate || reducedMotion.matches || previous === index) return;
      this.element.dataset.state = 'moving';
      const to = getComputedStyle(this.indicator).transform;
      const travel = this.indicator.animate([{transform:from}, {transform:to}], {duration:580,easing:'cubic-bezier(.22,.8,.22,1)'});
      this.animations.push(travel);
      if (['liquid','blob','aurora'].includes(this.kind)) {
        const shape = this.indicator.firstElementChild;
        this.animations.push(shape.animate([{scale:'1 1'},{scale:`${Math.min(2.3,1.3+Math.abs(index-previous)*.3)} .77`,offset:.35},{scale:'1 1'}], {duration:680,easing:'cubic-bezier(.2,.7,.3,1)'}));
      }
      await Promise.allSettled(this.animations.map(animation => animation.finished));
      if (version === this.version) { this.animations.forEach(animation => animation.cancel()); this.animations = []; this.element.dataset.state = 'idle'; }
    }
  }
  definitions.forEach((definition,index) => panels.push(new Dock(definition,index)));

  function stopPlayback(cancelAnimations = true) {
    playback?.abort(); playback = null;
    if (cancelAnimations) panels.forEach(panel => panel.stop());
    document.body.classList.add('paused');
    playButton.textContent = 'Автопоказ'; playButton.setAttribute('aria-pressed','false');
  }
  function pause(milliseconds, signal) {
    return new Promise(resolve => {
      if (signal.aborted) { resolve(); return; }
      const done = () => { clearTimeout(timer); signal.removeEventListener('abort',done); resolve(); };
      const timer = setTimeout(done,milliseconds); signal.addEventListener('abort',done,{once:true});
    });
  }
  async function startPlayback(reset = false) {
    stopPlayback();
    if (reset) panels.forEach(panel => panel.select(panel.initial,false));
    if (reducedMotion.matches) { announcement.textContent = 'Движение отключено системной настройкой. Выбирайте пункты вручную.'; return; }
    const controller = new AbortController(); playback = controller;
    document.body.classList.remove('paused'); playButton.textContent = 'Пауза'; playButton.setAttribute('aria-pressed','true');
    const {signal} = controller;
    await pause(1000,signal);
    while (!signal.aborted) {
      await Promise.all(panels.map(panel => panel.select((panel.index+1)%panel.buttons.length)));
      if (!signal.aborted) await pause(1250,signal);
    }
  }
  playButton.addEventListener('click', () => playback ? stopPlayback() : startPlayback());
  document.querySelector('#replay').addEventListener('click', () => startPlayback(true));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stopPlayback(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopPlayback(); });
  startPlayback();
})();
