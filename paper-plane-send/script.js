'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const status = document.querySelector('#status');

class PaperPlane {
  constructor(button) {
    this.button = button;
    this.color = button.classList.contains('violet') ? 'violet' : 'dark';
    this.animations = new Set();
    this.runId = 0;
    button.addEventListener('click', () => this.send());
  }

  animate(selector, frames, duration, easing = 'ease-in-out') {
    const animation = this.button.querySelector(selector).animate(frames, { duration, easing, fill: 'forwards' });
    this.animations.add(animation);
    return animation.finished;
  }

  clearAnimations() {
    this.animations.forEach(animation => animation.cancel());
    this.animations.clear();
  }

  reset() {
    this.runId++;
    this.clearAnimations();
    this.button.dataset.state = 'idle';
    this.button.removeAttribute('aria-busy');
    this.button.setAttribute('aria-label', `Send, ${this.color}`);
  }

  finish() {
    this.button.dataset.state = 'sent';
    this.button.removeAttribute('aria-busy');
    this.button.setAttribute('aria-label', `Sent, ${this.color}. Send again`);
    this.clearAnimations();
    status.textContent = `${this.color === 'dark' ? 'Dark' : 'Violet'}: sent.`;
  }

  async send() {
    if (['folding', 'flying'].includes(this.button.dataset.state)) return;
    this.reset();
    const run = this.runId;
    if (reducedMotion.matches) { this.finish(); return; }
    this.button.dataset.state = 'folding';
    this.button.setAttribute('aria-busy', 'true');
    this.button.setAttribute('aria-label', `Sending, ${this.color}`);
    const fold = (start, middle, end) => [
      { clipPath: start, offset: 0 },
      { clipPath: middle, offset: .46 },
      { clipPath: middle, offset: .55 },
      { clipPath: end, offset: 1 }
    ];
    try {
      await Promise.all([
        this.animate('.label', [{opacity: 1}, {opacity: 0}], 150),
        this.animate('.plane', [{borderRadius: '10px', transform: 'scaleY(1)'}, {borderRadius: '0px', transform: 'scaleY(1)', offset: .5}, {borderRadius: '0px', transform: 'scaleY(1.45)'}], 480),
        this.animate('.left', fold('polygon(0% 0%,50% 0%,50% 100%,0% 100%)', 'polygon(50% 0%,50% 0%,50% 100%,0% 100%)', 'polygon(50% 0%,50% 75%,42% 75%,4% 88%)'), 480),
        this.animate('.right', fold('polygon(50% 0%,100% 0%,100% 100%,50% 100%)', 'polygon(50% 0%,50% 0%,100% 100%,50% 100%)', 'polygon(50% 0%,50% 0%,96% 88%,58% 75%)'), 480),
        this.animate('.crease-left', fold('polygon(50% 0%,50% 0%,50% 100%,50% 100%)', 'polygon(50% 0%,50% 0%,50% 94%,43% 94%)', 'polygon(50% 0%,50% 100%,42% 95%,44% 65%)'), 480),
        this.animate('.crease-right', fold('polygon(50% 0%,50% 0%,50% 100%,50% 100%)', 'polygon(50% 0%,50% 0%,57% 94%,50% 94%)', 'polygon(50% 0%,56% 65%,58% 95%,50% 100%)'), 480)
      ]);
      if (run !== this.runId) return;
      await this.animate('.plane', [{transform: 'rotate(0deg) scaleY(1.45)'}, {transform: 'rotate(55deg) scaleY(1.45)'}], 230);
      if (run !== this.runId) return;
      this.button.dataset.state = 'flying';
      await Promise.all([
        this.animate('.plane', [
          {transform: 'translate(0,0) rotate(55deg) scaleY(1.45)', opacity: 1},
          {transform: 'translate(55%,-100%) rotate(55deg) scaleY(1.45)', opacity: .8, offset: .75},
          {transform: 'translate(85%,-155%) rotate(55deg) scaleY(1.45)', opacity: 0}
        ], 340, 'cubic-bezier(.4,0,.8,.45)'),
        this.animate('.trails', [{opacity: 0, translate: '0px 0px'}, {opacity: .28, offset: .35}, {opacity: 0, translate: '48px -34px'}], 340)
      ]);
      if (run !== this.runId) return;
      await this.animate('.result', [{opacity: 0, transform: 'scale(.96)'}, {opacity: 1, transform: 'scale(1)'}], 160);
      if (run === this.runId) this.finish();
    } catch (error) {
      if (error.name !== 'AbortError') { this.reset(); console.error(error); }
    }
  }
}

const planes = [...document.querySelectorAll('.send')].map(button => new PaperPlane(button));
function resetAll() { planes.forEach(plane => plane.reset()); status.textContent = 'Ready to send.'; }
document.querySelector('.replay').addEventListener('click', resetAll);
document.addEventListener('keydown', event => { if (event.key === 'Escape') resetAll(); });
reducedMotion.addEventListener('change', resetAll);
