(() => {
  'use strict';
  const root = document.querySelector('.paradrop');
  const $ = selector => root.querySelector(selector);
  const rail = $('.track'), fill = $('.fill'), rig = $('.rig');
  const canopy = $('.canopy'), arrow = $('.arrow'), check = $('.check');
  const complete = $('.complete'), progress = $('.progress');
  const trigger = $('.download'), action = $('.action'), status = $('[role="status"]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);

  // The same sampled path is a closed ring, an unfurling arc, and the bar.
  function drawRail(unroll, wobble = 0) {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100, angle = -Math.PI / 2 - t * Math.PI * 2;
      const x = mix(300 + 56 * Math.cos(angle), 125 + 350 * t, unroll);
      const y = mix(200 + 56 * Math.sin(angle), 280, unroll) - Math.sin(t * Math.PI) * wobble;
      points.push(`${i ? 'L' : 'M'}${x.toFixed(3)} ${y.toFixed(3)}`);
    }
    rail.setAttribute('d', points.join(' '));
    fill.setAttribute('d', points.join(' '));
  }
  function setProgress(value) {
    const percent = Math.floor(value * 100);
    fill.style.strokeDashoffset = 1 - value;
    progress.setAttribute('aria-valuenow', percent);
    progress.firstElementChild.textContent = `${percent}%`;
  }
  function pose(y, rotation = 0, x = 300) {
    rig.setAttribute('transform', `translate(${x} ${y}) rotate(${rotation})`);
  }
  function tween(duration, draw, signal) {
    return new Promise((resolve, reject) => {
      let frame, start;
      const abort = () => { cancelAnimationFrame(frame); reject(new DOMException('Cancelled', 'AbortError')); };
      signal.addEventListener('abort', abort, {once:true});
      const tick = now => {
        if (signal.aborted) return;
        start ??= now;
        const t = Math.min(1, (now - start) / duration);
        draw(t);
        if (t < 1) frame = requestAnimationFrame(tick);
        else { signal.removeEventListener('abort', abort); resolve(); }
      };
      frame = requestAnimationFrame(tick);
    });
  }
  function reset(focus = false) {
    controller?.abort();
    controller = null;
    root.dataset.state = 'idle';
    drawRail(0); setProgress(0); fill.style.strokeDashoffset = 0;
    pose(200); rig.style.opacity = 1; arrow.style.opacity = 1;
    canopy.style.opacity = check.style.opacity = complete.style.opacity = progress.style.opacity = 0;
    trigger.disabled = false; action.hidden = true;
    status.textContent = 'Ready to download.';
    if (focus) trigger.focus();
  }
  async function start() {
    if (root.dataset.state !== 'idle') return;
    controller = new AbortController();
    const {signal} = controller;
    const reduced = motion.matches;
    root.dataset.state = 'unrolling';
    trigger.disabled = true;
    action.textContent = 'Cancel'; action.hidden = false; action.focus({preventScroll:true});
    status.textContent = 'Download animation started.';
    progress.style.opacity = 1;
    try {
      await tween(reduced ? 1 : 300, t => {
        const p = ease(t);
        drawRail(p, Math.sin(t * Math.PI) * 12);
        setProgress(t * .1);
        // Preserve a full ring at first, then hand its stroke to progress.
        fill.style.strokeDashoffset = (1 - t * .1) * p;
        pose(mix(200, 115, p), 180 * p);
        rig.style.opacity = reduced ? 0 : 1;
      }, signal);
      root.dataset.state = 'descending';
      await tween(reduced ? 240 : 2350, t => {
        setProgress(.1 + .9 * t);
        drawRail(1, Math.sin(t * 3 * Math.PI) * 5 * (1 - t));
        // Rotate the canopy back: the arrow stays pointing upwards after launch.
        canopy.style.opacity = Math.min(1, t * 14);
        canopy.setAttribute('transform', `rotate(180) scale(${Math.min(1, t * 10)})`);
        pose(mix(115, 255, t), 180 + Math.sin(t * 5 * Math.PI) * 5 * (1 - t), 300 + Math.sin(t * 4 * Math.PI) * 2);
      }, signal);
      root.dataset.state = 'landing';
      await tween(reduced ? 1 : 280, t => {
        rig.style.opacity = reduced ? 0 : 1 - t;
        check.style.opacity = t;
        complete.style.opacity = t;
        check.setAttribute('transform', `translate(300 255) scale(${mix(.7, 1, ease(t))}) translate(-300 -255)`);
      }, signal);
      rig.style.opacity = 0;
      root.dataset.state = 'complete';
      action.textContent = 'Replay';
      status.textContent = 'Complete. 100 percent. Replay is available.';
    } catch (error) {
      if (error.name !== 'AbortError') { reset(); status.textContent = 'Animation could not play. Please try again.'; console.error(error); }
    }
  }
  trigger.addEventListener('click', start);
  action.addEventListener('click', () => {
    if (root.dataset.state === 'complete') { reset(); start(); }
    else reset(true);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.dataset.state !== 'idle') reset(true);
  });
  motion.addEventListener('change', () => reset(true));
  reset();
})();
