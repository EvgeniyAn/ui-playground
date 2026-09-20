(() => {
  const card = document.querySelector('.card');
  const form = card.querySelector('form');
  const password = card.querySelector('#password');
  const username = card.querySelector('#username');
  const reveal = card.querySelector('.reveal');
  const submit = card.querySelector('.sign-in');
  const status = card.querySelector('.status');
  const panel = card.querySelector('.door-panel');
  const glow = card.querySelector('.door-glow');
  const person = card.querySelector('.person');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 'idle';
  let generation = 0;
  const animations = new Set();

  function updateEyes() {
    card.classList.toggle('covering', phase === 'idle' && (document.activeElement === password || document.activeElement === reveal));
  }
  async function animate(element, frames, duration) {
    const animation = element.animate(frames, {duration: motion.matches ? 1 : duration, easing: 'ease-in-out', fill: 'forwards'});
    animations.add(animation);
    await animation.finished;
  }
  function reset() {
    generation++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    phase = 'idle';
    card.dataset.phase = phase;
    card.classList.remove('happy', 'walking');
    submit.removeAttribute('aria-disabled');
    form.removeAttribute('aria-busy');
    status.textContent = '';
    updateEyes();
  }
  form.addEventListener('focusin', updateEyes);
  form.addEventListener('focusout', () => queueMicrotask(updateEyes));
  username.addEventListener('input', () => {
    card.style.setProperty('--look-x', `${Math.min(3, username.value.length / 4 - 2)}px`);
    card.style.setProperty('--look-y', '2px');
  });
  reveal.addEventListener('click', () => {
    const showing = password.type === 'password';
    password.type = showing ? 'text' : 'password';
    reveal.setAttribute('aria-pressed', String(showing));
    reveal.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
    password.focus();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (phase !== 'idle') return;
    const run = ++generation;
    phase = 'opening';
    card.dataset.phase = phase;
    card.classList.remove('covering', 'happy');
    submit.setAttribute('aria-disabled', 'true');
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Signing you in…';
    try {
      await Promise.all([animate(panel, [{transform:'rotateY(0deg)'},{transform:'rotateY(76deg)'}], 380), animate(glow, [{opacity:0},{opacity:1}], 380)]);
      if (run !== generation) return;
      phase = 'walking'; card.dataset.phase = phase; card.classList.add('walking');
      await animate(person, [{transform:'translateX(0)',opacity:1},{transform:'translateX(30px)',opacity:1,offset:.78},{transform:'translateX(36px)',opacity:0}], 760);
      if (run !== generation) return;
      card.classList.remove('walking');
      phase = 'closing'; card.dataset.phase = phase;
      await Promise.all([animate(panel,[{transform:'rotateY(76deg)'},{transform:'rotateY(0deg)'}],300),animate(glow,[{opacity:1},{opacity:0}],300)]);
      if (run !== generation) return;
      phase = 'complete'; card.dataset.phase = phase;
      card.classList.add('happy');
      form.removeAttribute('aria-busy');
      submit.removeAttribute('aria-disabled');
      status.textContent = 'Welcome to Den!';
    } catch (error) {
      if (error.name !== 'AbortError') { reset(); status.textContent = 'Please try again.'; }
    }
  });
  submit.addEventListener('click', () => { if (phase === 'complete') reset(); });
  document.querySelector('.replay').addEventListener('click', () => { reset(); if (form.checkValidity()) form.requestSubmit(); else username.focus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
  for (const button of card.querySelectorAll('[data-info]')) button.addEventListener('click', () => { if (phase === 'idle' || phase === 'complete') status.textContent = button.dataset.info; });
  reset();
})();
