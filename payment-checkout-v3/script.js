(() => {
  'use strict';

  document.querySelectorAll('[data-checkout-demo]').forEach(demo => {
    const $ = selector => demo.querySelector(selector);
    const panel = $('.checkout');
    const form = $('.checkout-form');
    const pay = $('.pay-button');
    const payLabel = $('.pay-label');
    const payText = $('.pay-text');
    const token = $('.token-icons');
    const cardIcon = $('.token-card');
    const lockIcon = $('.token-lock');
    const checkIcon = $('.token-check');
    const checkPath = $('.token-check path');
    const verification = $('.verification');
    const ripples = $('.ripples');
    const ring = $('.progress-ring');
    const arc = $('.progress-arc');
    const progressCopy = $('.progress-copy');
    const percentage = $('.percentage');
    const success = $('.success-content');
    const halo = $('.success-halo');
    const heading = $('.success-heading');
    const confirmation = $('.confirmation');
    const details = $('.details-button');
    const receipt = $('.receipt');
    const status = $('.status');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const pulses = new Set();
    let state = 'ready';
    let run = 0;
    let progressFrame = 0;

    function setState(value) {
      state = value;
      panel.dataset.state = value;
    }

    function motion(element, keyframes, duration, options = {}) {
      const animation = element.animate(keyframes, {
        easing: 'cubic-bezier(.22,.75,.25,1)',
        fill: 'forwards',
        ...options,
        duration: reducedMotion.matches ? 1 : duration,
        delay: reducedMotion.matches ? 0 : (options.delay || 0)
      });
      animations.add(animation);
      return animation;
    }

    function animate(element, keyframes, duration, options) {
      return motion(element, keyframes, duration, options).finished;
    }

    function startPulses() {
      if (reducedMotion.matches) return;
      [...ripples.children].forEach((layer, index) => {
        const animation = motion(layer, [
          { transform: 'scale(1)', opacity: .85 },
          { transform: 'scale(1.045)', opacity: 1 },
          { transform: 'scale(1)', opacity: .85 }
        ], 1300 + index * 160, { iterations: Infinity, easing: 'ease-in-out' });
        pulses.add(animation);
      });
    }

    function stopPulses() {
      pulses.forEach(animation => { animation.cancel(); animations.delete(animation); });
      pulses.clear();
    }

    function updateProgress(value) {
      percentage.textContent = `${value}%`;
      verification.setAttribute('aria-valuenow', String(value));
      verification.setAttribute('aria-valuetext', `${value}%`);
      cardIcon.style.opacity = value < 20 ? '1' : '0';
      lockIcon.style.opacity = value >= 20 ? '1' : '0';
      arc.style.stroke = value >= 80 ? '#19c05b' : value > 45 ? '#8970ff' : '#5e90ff';
    }

    async function verifyPayment(currentRun) {
      const steps = [
        { offset: 0, value: 0 },
        { offset: .28, value: 43 },
        { offset: .53, value: 72 },
        { offset: .68, value: 75 },
        { offset: 1, value: 100 }
      ];
      const duration = reducedMotion.matches ? 1 : 2250;
      const progress = motion(arc, steps.map(step => ({
        offset: step.offset, strokeDashoffset: String(100 - step.value)
      })), duration, { easing: 'linear' });

      const tick = () => {
        if (currentRun !== run) return;
        const position = Math.min(1, Number(progress.currentTime || 0) / duration);
        const end = steps.findIndex((step, index) => index > 0 && position <= step.offset);
        if (end > 0) {
          const a = steps[end - 1];
          const b = steps[end];
          updateProgress(Math.round(a.value + (b.value - a.value) * (position - a.offset) / (b.offset - a.offset)));
        }
        progressFrame = requestAnimationFrame(tick);
      };
      tick();
      try {
        await progress.finished;
        if (currentRun === run) updateProgress(100);
      } finally {
        if (currentRun === run) cancelAnimationFrame(progressFrame);
      }
    }

    function burst() {
      if (reducedMotion.matches) return;
      const colors = ['#8a53ef', '#ff4f91', '#28c977', '#34bad4', '#5283fb', '#f4ca3c'];
      for (let index = 0; index < 48; index++) {
        const particle = document.createElement('i');
        const angle = Math.random() * Math.PI * 2;
        const radius = 35 + Math.random() * 140;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * .7;
        const rotation = Math.round(Math.random() * 360);
        const size = 2 + Math.random() * 4;
        particle.style.cssText = `background:${colors[index % colors.length]};width:${size}px;height:${size}px;border-radius:${index % 3 === 0 ? '50%' : '1px'}`;
        $('.confetti').append(particle);
        const animation = motion(particle, [
          { transform: 'translate(-2px, 0) scale(.3)', opacity: 0, offset: 0 },
          { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`, opacity: .95, offset: .18 },
          { opacity: .75, offset: .6 },
          { transform: `translate(${x * 1.3}px, ${y + 340}px) rotate(${rotation + 200}deg) scale(.6)`, opacity: 0, offset: 1 }
        ], 1900 + Math.random() * 1100, { easing: 'cubic-bezier(.15,.45,.65,1)' });
        animation.finished.catch(error => {
          if (error.name !== 'AbortError') console.error(error);
        }).finally(() => {
          animation.cancel();
          animations.delete(animation);
          particle.remove();
        });
      }
    }

    function reset() {
      run++;
      cancelAnimationFrame(progressFrame);
      animations.forEach(animation => animation.cancel());
      animations.clear();
      pulses.clear();
      $('.confetti').replaceChildren();
      if (receipt.open) receipt.close();
      $('.payment-method').open = false;
      form.inert = false;
      success.hidden = true;
      success.inert = true;
      verification.hidden = true;
      verification.setAttribute('aria-hidden', 'true');
      verification.removeAttribute('role');
      verification.removeAttribute('aria-valuenow');
      verification.removeAttribute('aria-valuetext');
      verification.removeAttribute('aria-valuemin');
      verification.removeAttribute('aria-valuemax');
      verification.removeAttribute('aria-label');
      panel.removeAttribute('aria-busy');
      pay.disabled = false;
      pay.setAttribute('aria-label', 'Pay Now — demo payment');
      payText.textContent = 'Pay Now';
      [cardIcon, lockIcon, checkIcon, arc].forEach(element => element.removeAttribute('style'));
      percentage.textContent = '0%';
      setState('ready');
      status.textContent = 'Demo payment ready.';
    }

    async function start() {
      if (state !== 'ready') return;
      const currentRun = ++run;
      const keepGoing = () => {
        if (currentRun !== run) throw new DOMException('Animation reset', 'AbortError');
      };
      pay.disabled = true;
      form.inert = true;
      $('.payment-method').open = false;
      panel.setAttribute('aria-busy', 'true');
      pay.setAttribute('aria-label', 'Processing demo payment');
      payText.textContent = 'Processing…';
      status.textContent = 'Processing demo payment.';
      setState('preparing');

      try {
        // This is the deliberate initial processing beat, not a transition timer.
        await animate(pay, [{ background: '#752ced' }, { background: '#6d23dc' }, { background: '#752ced' }], 600);
        keepGoing();
        setState('compressing');
        await Promise.all([
          animate(payLabel, [{ opacity: 1 }, { opacity: 0 }], 200),
          animate(pay, [{ width: `${pay.getBoundingClientRect().width}px` }, { width: '60px' }], 420)
        ]);
        keepGoing();
        setState('lifting');
        verification.hidden = false;
        // Ripple expansion starts during the lift, as in the reference.
        await Promise.all([
          animate(form, [{ opacity: 1 }, { opacity: 0 }], 350),
          animate(panel, [{ background: '#121017', borderColor: '#2a252f' }, { background: '#09060e', borderColor: '#17101e' }], 950),
          animate(pay, [{ top: 'calc(100% - 79px)', height: '49px' }, { top: 'calc(50% - 30px)', height: '60px' }], 500),
          animate(ripples, [{ opacity: 0, transform: 'scale(.08)' }, { opacity: 1, transform: 'scale(1)' }], 1050, { easing: 'cubic-bezier(.2,.55,.25,1)' }),
          animate(token, [{ opacity: 0 }, { opacity: 1 }], 450, { delay: 500 })
        ]);
        keepGoing();
        startPulses();
        setState('verifying');
        pay.setAttribute('aria-label', 'Verifying demo payment');
        status.textContent = 'Verifying demo payment.';
        verification.removeAttribute('aria-hidden');
        verification.setAttribute('role', 'progressbar');
        verification.setAttribute('aria-label', 'Verifying payment');
        verification.setAttribute('aria-valuemin', '0');
        verification.setAttribute('aria-valuemax', '100');
        verification.setAttribute('aria-valuenow', '0');
        verification.setAttribute('aria-valuetext', '0%');
        await Promise.all([
          animate(ring, [{ opacity: 0 }, { opacity: 1 }], 200),
          animate(progressCopy, [{ opacity: 0 }, { opacity: 1 }], 220),
          verifyPayment(currentRun)
        ]);
        keepGoing();
        setState('approving');
        cardIcon.style.opacity = '0';
        lockIcon.style.opacity = '0';
        await animate(pay, [{ background: '#752ced', borderRadius: '12px' }, { background: '#17bf55', borderRadius: '50%' }], 400);
        keepGoing();
        await Promise.all([
          animate(checkIcon, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 280),
          animate(checkPath, [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], 300),
          animate(pay, [{ boxShadow: '0 0 20px #18c45d00' }, { boxShadow: '0 0 25px #18c45d35' }], 300)
        ]);
        keepGoing();
        stopPulses();
        setState('settling');
        success.hidden = false;
        success.inert = true;
        await Promise.all([
          animate(ripples, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.18)' }], 650),
          animate(ring, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.3)' }], 400),
          animate(progressCopy, [{ opacity: 1 }, { opacity: 0 }], 220),
          animate(pay, [{ top: 'calc(50% - 30px)', transform: 'translateX(-50%) scale(1)' }, { top: '68px', transform: 'translateX(-50%) scale(1.28)' }], 650)
        ]);
        keepGoing();
        verification.hidden = true;
        verification.setAttribute('aria-hidden', 'true');
        burst();
        await Promise.all([
          animate(halo, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], 500),
          animate(heading, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], 360),
          animate(confirmation, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 360, { delay: 100 }),
          animate(details, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 360, { delay: 220 })
        ]);
        keepGoing();
        setState('success');
        success.inert = false;
        panel.removeAttribute('aria-busy');
        pay.setAttribute('aria-label', 'Demo payment successful');
        status.textContent = 'Demo payment successful. Order confirmed. No payment was made.';
        $('.success-heading h2').focus({ preventScroll: true });
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Checkout animation failed:', error);
        if (currentRun === run) {
          reset();
          status.textContent = 'The animation could not finish. Please try again.';
          pay.focus({ preventScroll: true });
        }
      }
    }

    pay.addEventListener('click', start);
    $('.replay-button').addEventListener('click', () => {
      reset();
      start();
    });
    details.addEventListener('click', () => {
      if (state === 'success') receipt.showModal();
    });
    receipt.addEventListener('click', event => {
      if (event.target !== receipt) return;
      const bounds = receipt.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) receipt.close();
    });
    reducedMotion.addEventListener('change', () => {
      if (!reducedMotion.matches) return;
      stopPulses();
      $('.confetti').replaceChildren();
      animations.forEach(animation => {
        if (animation.playState === 'running' && animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
      });
    });
    success.inert = true;
  });
})();
