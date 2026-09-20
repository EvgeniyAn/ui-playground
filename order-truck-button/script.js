(() => {
  'use strict';
  const demo = document.querySelector('.demo');
  const button = demo.querySelector('.order');
  const replay = demo.querySelector('.replay');
  const status = demo.querySelector('[role="status"]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const parts = Object.fromEntries(['initial', 'success', 'parcel', 'truck', 'road', 'lights'].map(name => [name, demo.querySelector(`.${name}`)]));
  const doors = [demo.querySelector('.door.top'), demo.querySelector('.door.bottom')];
  const animations = new Set();
  let generation = 0;
  let busy = false;

  function reset() {
    generation++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    busy = false;
    button.dataset.state = 'idle';
    button.removeAttribute('aria-disabled');
    button.setAttribute('aria-label', 'Complete Order');
    status.textContent = '';
  }

  function animate(element, frames, duration, easing = 'ease-in-out') {
    const animation = element.animate(frames, { duration, easing, fill: 'forwards' });
    animations.add(animation);
    return animation.finished;
  }

  function complete() {
    for (const animation of animations) animation.cancel();
    animations.clear();
    button.dataset.state = 'complete';
    button.removeAttribute('aria-disabled');
    button.setAttribute('aria-label', 'Order Placed. Replay animation');
    status.textContent = 'Order placed. Press the button to replay.';
    busy = false;
  }

  async function run() {
    if (busy) return;
    reset();
    busy = true;
    const current = generation;
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-label', 'Placing order');
    status.textContent = 'Placing order.';
    if (reducedMotion.matches) { complete(); return; }
    // Dependent phases await real animation completion. Reset cancels the promises.
    try {
      button.dataset.state = 'package';
      await Promise.all([
        animate(parts.initial, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-14px)' }], 200),
        animate(parts.parcel, [{ opacity: 0, transform: 'translateY(-35px)' }, { opacity: 1, transform: 'translateY(0)' }], 250)
      ]);
      button.dataset.state = 'arrival';
      await animate(parts.truck, [{ transform: 'translate(320px, 11px)' }, { transform: 'translate(150px, 11px)' }], 500, 'cubic-bezier(.2,.7,.3,1)');
      button.dataset.state = 'opening';
      await Promise.all(doors.map((door, index) => animate(door, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${index ? -95 : 95}deg)` }], 350)));
      button.dataset.state = 'loading';
      await animate(parts.truck, [{ transform: 'translate(150px, 11px)' }, { transform: 'translate(75px, 11px)' }], 750);
      await animate(parts.parcel, [{ opacity: 1 }, { opacity: 0 }], 70);
      button.dataset.state = 'closing';
      await Promise.all(doors.map((door, index) => animate(door, [{ transform: `rotate(${index ? -95 : 95}deg)` }, { transform: 'rotate(0deg)' }], 300)));
      button.dataset.state = 'ready';
      await animate(parts.truck, [{ transform: 'translate(75px, 11px)' }, { transform: 'translate(58px, 11px)' }], 500);
      // A deliberate stationary pause, matching the loaded truck in the reference.
      await animate(parts.truck, [{ transform: 'translate(58px, 11px)' }, { transform: 'translate(58px, 11px)' }], 450);
      button.dataset.state = 'headlights';
      await Promise.all([
        animate(parts.lights, [{ opacity: 0 }, { opacity: 1 }], 250),
        animate(parts.road, [{ opacity: 0 }, { opacity: .65 }], 250)
      ]);
      button.dataset.state = 'departing';
      await Promise.all([
        animate(parts.truck, [{ transform: 'translate(58px, 11px)' }, { transform: 'translate(325px, 11px)' }], 900, 'cubic-bezier(.55,0,.85,.6)'),
        animate(parts.road, [{ transform: 'translateX(0)' }, { transform: 'translateX(-95px)' }], 900, 'linear')
      ]);
      await animate(parts.road, [{ opacity: .65 }, { opacity: 0 }], 200);
      button.dataset.state = 'confirmation';
      await animate(parts.success, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 200);
      if (current === generation) complete();
    } catch (error) {
      if (error.name !== 'AbortError') {
        reset();
        status.textContent = 'Animation could not finish. Please try again.';
        console.error(error);
      }
    }
  }

  button.addEventListener('click', run);
  replay.addEventListener('click', () => { reset(); run(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') reset();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && busy) { reset(); complete(); }
  });
})();
