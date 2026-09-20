class OtpDemo {
  constructor(card) {
    this.card = card;
    this.inputs = [...card.querySelectorAll('input')];
    this.tiles = [...card.querySelectorAll('.digit')];
    this.animations = new Set();
    this.run = 0;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)');
    this.inputs.forEach((input, index) => {
      input.addEventListener('focus', () => input.select());
      input.addEventListener('input', () => this.enter(index, input.value));
      input.addEventListener('paste', event => {
        event.preventDefault();
        this.enter(index, event.clipboardData.getData('text'));
      });
      input.addEventListener('keydown', event => {
        if (this.card.dataset.state !== 'entry') return;
        if (event.key === 'Backspace' && !input.value && index) {
          event.preventDefault();
          this.inputs[index - 1].value = '';
          this.inputs[index - 1].focus();
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          this.inputs[Math.max(0, Math.min(3, index + (event.key === 'ArrowLeft' ? -1 : 1)))].focus();
        }
      });
    });
    card.querySelector('.resend').addEventListener('click', () => {
      this.reset();
      this.status('Demo code reset. Enter any four digits. No SMS is sent.');
    });
    card.parentElement.querySelector('.replay').addEventListener('click', () => this.reset());
  }
  status(text) { this.card.querySelector('[role="status"]').textContent = text; }
  enter(index, text) {
    if (this.card.dataset.state !== 'entry') return;
    const digits = text.replace(/\D/g, '').slice(0, 4 - index);
    this.inputs[index].value = '';
    [...digits].forEach((digit, offset) => { this.inputs[index + offset].value = digit; });
    if (digits.length) this.inputs[Math.min(3, index + digits.length)].focus();
    if (this.inputs.every(input => /^\d$/.test(input.value))) this.verify();
  }
  async animate(element, frames, duration, extra = {}) {
    const animation = element.animate(frames, { duration: this.reduce.matches ? 1 : duration, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards', ...extra });
    this.animations.add(animation);
    await animation.finished;
  }
  async verify() {
    const run = ++this.run;
    this.card.dataset.state = 'gather';
    this.status('Verifying demo code.');
    this.inputs.forEach(input => { input.readOnly = true; input.blur(); });
    const q = selector => this.card.querySelector(selector);
    const destinations = [[63,0],[63,100],[189,0],[189,100]];
    try {
      await Promise.all([
        this.animate(q('.resend-row'), [{opacity:1},{opacity:0}], 180),
        ...this.tiles.map((tile, i) => this.animate(tile, [{transform:'translate(0,0)'},{transform:`translate(${destinations[i][0] - [1,85,169,253][i]}px,${destinations[i][1]-50}px)`}], 560)),
        ...[...this.card.querySelectorAll('.orbit')].map(orbit => this.animate(orbit, [{opacity:0,transform:'rotate(-80deg)'},{opacity:1,transform:'rotate(0deg)'}], 560))
      ]);
      this.card.dataset.state = 'connect';
      await this.animate(q('.connections path'), [{strokeDashoffset:452},{strokeDashoffset:0}], 1180);
      this.card.dataset.state = 'merge';
      await Promise.all([
        this.animate(q('.connections'), [{opacity:1},{opacity:0}], 220),
        ...this.tiles.map((tile,i) => this.animate(tile, [{transform: getComputedStyle(tile).transform, opacity:1},{transform:`translate(${126-[1,85,169,253][i]}px,0px) scale(.6)`,opacity:0}], 330)),
        this.animate(q('header'), [{opacity:1},{opacity:0}], 250)
      ]);
      if (run !== this.run) return;
      this.card.dataset.state = 'success';
      q('h1').textContent = 'Verified Successfully';
      q('.description').textContent = 'Your number has been verified.';
      q('.resend-row').hidden = true;
      q('.secure').hidden = false;
      this.status('Demo verification complete. Use Replay to try again.');
      this.burst();
      await Promise.all([
        this.animate(q('header'), [{opacity:0},{opacity:1}], 330),
        this.animate(q('.success-icon'), [{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'scale(1.12)',offset:.6},{opacity:1,transform:'scale(1)'}], 430),
        this.animate(q('.secure'), [{opacity:0},{opacity:1}], 500)
      ]);
    } catch (error) { if (error.name !== 'AbortError') console.error(error); }
  }
  burst() {
    if (this.reduce.matches) return;
    const container = this.card.querySelector('.confetti');
    for (let i = 0; i < 65; i++) {
      const particle = document.createElement('i');
      container.append(particle);
      const angle = Math.random() * Math.PI * 2;
      const distance = 35 + Math.random() * 125;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      particle.style.borderRadius = i % 3 ? '1px' : '50%';
      this.animate(particle, [{transform:'translate(0,0) scale(.3)',opacity:1},{transform:`translate(${x}px,${y}px) rotate(${i*27}deg)`,opacity:1,offset:.38},{transform:`translate(${x*1.25}px,${y+120}px) rotate(${i*45}deg) scale(.4)`,opacity:0}], 1450 + Math.random()*400, {easing:'cubic-bezier(.15,.6,.35,1)'}).then(() => particle.remove()).catch(() => {});
    }
  }
  reset() {
    ++this.run;
    this.animations.forEach(animation => animation.cancel());
    this.animations.clear();
    this.card.dataset.state = 'entry';
    this.card.querySelector('h1').textContent = "Let's verify your number";
    this.card.querySelector('.description').innerHTML = "We've sent a 4-digit code to your phone.<br>It'll auto-verify once entered.";
    this.card.querySelector('.resend-row').hidden = false;
    this.card.querySelector('.secure').hidden = true;
    this.card.querySelector('.confetti').replaceChildren();
    this.inputs.forEach(input => { input.value = ''; input.readOnly = false; });
    this.status('Enter any four digits to replay.');
    this.inputs[0].focus();
  }
}
document.querySelectorAll('.otp-card').forEach(card => new OtpDemo(card));
