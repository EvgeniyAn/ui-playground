(() => {
  'use strict';
  const people = [
    ['rahim', 'Rahim Chowdhury', 'CEO & Founder', '#8c5b26'],
    ['mei', 'Mei Chen', 'Design Lead', '#a64731'],
    ['marcus', 'Marcus Boateng', 'Frontend Engineer', '#227154'],
    ['sofia', 'Sofía Marín', 'Motion Designer', '#28736d'],
    ['anna', 'Anna Lindqvist', 'Engineering Lead', '#3b63a2'],
    ['karim', 'Karim Haddad', 'Art Director', '#ad293e'],
    ['naomi-color', 'Naomi Adeyemi', 'Producer', '#705d80'],
  ];
  const root = document.querySelector('.team');
  const deck = root.querySelector('.deck');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = people.length;
  const wrap = n => ((n % count) + count) % count;
  const distance = (index, position) => wrap(index - position + count / 2) - count / 2;
  const pad = n => String(n + 1).padStart(2, '0');
  const cards = people.map(([file, name, role], i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.setAttribute('aria-label', `${name}, ${role}, ${i + 1} of ${count}`);
    card.innerHTML = `<span class="portrait"><img class="shot" src="assets/${file}.png" alt="" draggable="false"><img class="shot mono" src="assets/${file}.png" alt="" draggable="false"><span class="plate"><b>${name}</b><em>${role}</em></span></span><span class="card-number" aria-hidden="true">${pad(i)}</span>`;
    root.querySelector('.cards').append(card);
    card.addEventListener('click', event => { if (!suppressClick || event.detail === 0) select(i); });
    return { element: card, mono: card.querySelector('.mono'), number: card.querySelector('.card-number') };
  });
  const dots = people.map(([, name], i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dot';
    button.setAttribute('aria-label', `Show ${name}`);
    button.addEventListener('click', () => select(i));
    root.querySelector('.pagination').append(button);
    return button;
  });
  let position = 0;
  let target = 0;
  let frame = 0;
  let finish = null;
  let replayId = 0;
  let pointer = null;
  let suppressClick = false;
  let wheelTime = -Infinity;
  const current = root.querySelector('.current');
  const status = root.querySelector('.status');
  const replay = root.querySelector('.replay');
  function render() {
    const width = cards[0].element.offsetWidth;
    const active = wrap(Math.round(position));
    root.style.setProperty('--accent', people[active][3]);
    current.textContent = pad(active);
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
    cards.forEach(({element, mono, number}, i) => {
      const d = distance(i, position);
      const a = Math.abs(d);
      const near = Math.min(a, 1);
      const x = Math.sign(d) * width * (.74 * near + .46 * Math.max(0, a - 1));
      const scale = 1 - .22 * near - .10 * Math.max(0, a - 1);
      element.style.transform = `perspective(1100px) translate3d(${x}px, ${width * .17 * near}px, 0) rotateY(${-Math.sign(d) * (19 * near + 5 * Math.max(0, a - 1))}deg) scale(${scale})`;
      element.style.zIndex = String(Math.round(100 - a * 20));
      element.style.opacity = String(Math.max(0, Math.min(1, (3.35 - a) / .45)));
      element.tabIndex = i === active ? 0 : -1;
      element.setAttribute('aria-current', String(i === active));
      const grey = Math.min(1, a / .72);
      mono.style.opacity = String(grey * grey * (3 - 2 * grey));
      number.style.opacity = String(Math.max(0, 1 - a * 2));
    });
  }
  function cancelAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (finish) { finish(false); finish = null; }
  }
  function announce() {
    const i = wrap(Math.round(position));
    status.textContent = `${pad(i)} / 07 — ${people[i][1]}, ${people[i][2]}`;
    root.dataset.active = String(i);
  }
  function animate(next) {
    cancelAnimation();
    target = next;
    const start = position;
    const duration = reducedMotion.matches ? 0 : Math.min(900, 600 + Math.abs(next - start) * 50);
    return new Promise(resolve => {
      finish = resolve;
      const began = performance.now();
      function tick(now) {
        const t = duration ? Math.min(1, (now - began) / duration) : 1;
        const eased = (1 - Math.cos(Math.PI * t)) / 2;
        position = start + (next - start) * eased;
        render();
        if (t < 1) frame = requestAnimationFrame(tick);
        else { frame = 0; finish = null; announce(); resolve(true); }
      }
      tick(began);
    });
  }
  function stopReplay() { replayId++; replay.innerHTML = 'Replay <span aria-hidden="true">↻</span>'; }
  function move(delta) { stopReplay(); animate(target + delta); }
  function select(index) { stopReplay(); animate(target + distance(index, target)); }
  root.querySelector('.previous').addEventListener('click', () => move(-1));
  root.querySelector('.next').addEventListener('click', () => move(1));
  root.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'Home') select(0);
    if (event.key === 'End') select(count - 1);
    if (event.key === 'Escape') { stopReplay(); pointer = null; deck.classList.remove('dragging'); animate(Math.round(position)); }
  });
  deck.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY)) < 8) return;
    event.preventDefault();
    if (performance.now() - wheelTime < 680) return;
    wheelTime = performance.now();
    move(Math.sign(Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY));
  }, { passive: false });
  deck.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    stopReplay(); cancelAnimation();
    suppressClick = false;
    pointer = { id: event.pointerId, x: event.clientX, start: position };
  });
  deck.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    if (Math.abs(dx) > 6) {
      suppressClick = true;
      deck.setPointerCapture(event.pointerId);
      deck.classList.add('dragging');
    }
    if (suppressClick) { position = pointer.start - dx / (cards[0].element.offsetWidth * .75); render(); }
  });
  function endDrag(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    pointer = null;
    deck.classList.remove('dragging');
    if (deck.hasPointerCapture(event.pointerId)) deck.releasePointerCapture(event.pointerId);
    animate(Math.round(position));
  }
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);
  deck.addEventListener('lostpointercapture', endDrag);
  replay.addEventListener('click', async () => {
    stopReplay();
    const id = replayId;
    replay.textContent = 'Playing ↻';
    if (!await animate(target + distance(0, target)) || id !== replayId) return;
    if (reducedMotion.matches) { stopReplay(); return; }
    for (let i = 1; i <= count; i++) {
      // Deliberate viewing pause; movement itself is awaited to completion.
      await new Promise(resolve => setTimeout(resolve, 480));
      if (id !== replayId) return;
      if (!await animate(target + 1) || id !== replayId) return;
    }
    stopReplay();
  });
  reducedMotion.addEventListener('change', () => { stopReplay(); animate(Math.round(target)); });
  new ResizeObserver(render).observe(deck);
  render(); announce();
})();
