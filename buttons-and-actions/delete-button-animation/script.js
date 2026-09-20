// A visual demo: no files are read or deleted.
// Each instance owns its state, so both buttons can run independently.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

document.querySelectorAll('.gulp').forEach((root) => {
  const button = root.querySelector('button');
  const label = root.querySelector('.label');
  const status = root.querySelector('.status');
  const text = label.textContent;
  const letters = Array.from(text, (character) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = character;
    return span;
  });
  label.replaceChildren(...letters);

  let busy = false;
  let flights = [];
  const setState = (state) => { root.dataset.state = state; };

  async function eatLabel() {
    const bounds = button.getBoundingClientRect();
    const unit = bounds.width / 244;
    // Read the initial positions together, before changing the visual state.
    const positions = letters.map((letter) => letter.getBoundingClientRect());
    let landed = 0;
    setState('eat');

    await Promise.all(letters.map(async (letter, index) => {
      const box = positions[index];
      const dx = bounds.left + 54 * unit - (box.left + box.width / 2);
      const transform = (x, y, rotation, scale = 1) =>
        `translate(${x}px, ${y * unit}px) rotate(${rotation}deg) scale(${scale})`;

      const flight = letter.animate([
        { transform: transform(0, 0, 0), opacity: 1, offset: 0 },
        { transform: transform(dx * .45, -24, -16), opacity: 1, offset: .35 },
        { transform: transform(dx, -38, 10, .8), opacity: 1, offset: .65 },
        { transform: transform(dx, 11, 24, .25), opacity: 0, offset: 1 },
      ], {
        duration: 560,
        delay: 180 + index * 110,
        easing: 'cubic-bezier(.45, 0, .55, 1)',
        fill: 'forwards',
      });
      flights.push(flight);
      await flight.finished;
      // The fill rises when a letter actually lands, not on a separate timer.
      landed += 1;
      root.style.setProperty('--fill', `${31 * (1 - landed / letters.length)}px`);
    }));
  }

  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-busy', 'true');
    status.textContent = '';

    try {
      if (reducedMotion.matches) {
        label.style.visibility = 'hidden';
        setState('done');
        status.textContent = 'Готово. Демонстрация завершена.';
        await wait(700);
      } else {
        await eatLabel();
        await wait(100);
        setState('furl');
        // Wait for this button's actual transition, independently of its neighbour.
        // getAnimations() flushes the style change and returns the new transition.
        const morphs = button.getAnimations().filter((animation) =>
          animation.transitionProperty === 'width');
        await Promise.allSettled(morphs.map((animation) => animation.finished));
        setState('pending');
        await wait(650);
        setState('done');
        root.style.setProperty('--fill', '31px');
        status.textContent = 'Готово. Демонстрация завершена.';
        await wait(520);
      }
    } finally {
      flights.forEach((flight) => flight.cancel());
      flights = [];
      label.style.visibility = '';
      root.style.removeProperty('--fill');
      setState('reset');
      await wait(reducedMotion.matches ? 0 : 440);
      setState('idle');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('aria-busy');
      busy = false;
    }
  });
});
