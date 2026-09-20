'use strict';
const scene = document.querySelector('.scene');
const character = document.querySelector('.character');
const card = document.querySelector('.login-card');
const beam = document.querySelector('.beam');
const core = document.querySelector('.torch-core');
const halo = document.querySelector('.halo');
const skip = document.querySelector('#skip');
const replay = document.querySelector('#replay');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const frames = Array.from({length:42}, (_, index) => {
  const image = new Image();
  image.src = `assets/walk-${String(index).padStart(2, '0')}.png`;
  return image;
});
let generation = 0;
let frameRequest = 0;
let activeAnimations = new Set();
let cancelWalk = null;
function cancel() {
  generation++;
  cancelAnimationFrame(frameRequest);
  if (cancelWalk) { cancelWalk(false); cancelWalk = null; }
  for (const animation of activeAnimations) animation.cancel();
  activeAnimations.clear();
}
async function animate(element, keyframes, duration) {
  const animation = element.animate(keyframes, {duration, fill:'forwards', easing:'ease-in-out'});
  activeAnimations.add(animation);
  try { await animation.finished; return true; }
  catch { return false; }
  finally { activeAnimations.delete(animation); }
}
function walk() {
  return new Promise(resolve => {
    cancelWalk = resolve;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / 2750, 1);
      character.src = frames[Math.min(41, Math.floor(progress * 42))].src;
      if (progress < 1) frameRequest = requestAnimationFrame(step);
      else { cancelWalk = null; resolve(true); }
    }
    frameRequest = requestAnimationFrame(step);
  });
}
function finish(moveFocus = false) {
  cancel();
  scene.querySelectorAll('*').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
  character.src = frames[41].src;
  for (const element of [beam, core, halo, card]) element.style.opacity = '1';
  beam.style.transform = 'scaleX(1)';
  card.style.transform = 'translateY(-50%)';
  card.inert = false;
  scene.dataset.phase = 'ready';
  skip.hidden = true;
  replay.hidden = false;
  if (moveFocus) document.querySelector('#email').focus({preventScroll:true});
}
async function start() {
  cancel();
  const run = generation;
  scene.querySelectorAll('*').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
  for (const element of [beam, core, halo, card]) element.style.opacity = '0';
  card.inert = true;
  skip.hidden = false;
  replay.hidden = true;
  character.src = frames[0].src;
  scene.dataset.phase = 'walking';
  if (reducedMotion.matches) { finish(); return; }
  if (!await walk() || run !== generation) return;
  scene.dataset.phase = 'lighting';
  core.style.opacity = '1';
  if (!await animate(beam, [{opacity:0,transform:'scaleX(.03)'},{opacity:1,transform:'scaleX(1)'}], 650) || run !== generation) return;
  scene.dataset.phase = 'revealing';
  if (!await animate(halo, [{opacity:0,transform:'scale(.1)'},{opacity:1,transform:'scale(1)'}], 450) || run !== generation) return;
  if (!await animate(card, [{opacity:0,transform:'translateY(-50%) scale(.94)',filter:'blur(8px)'},{opacity:1,transform:'translateY(-50%) scale(1)',filter:'blur(0px)'}], 850) || run !== generation) return;
  finish();
}
skip.addEventListener('click', () => finish(true));
replay.addEventListener('click', () => { start(); if (!reducedMotion.matches) skip.focus({preventScroll:true}); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && scene.dataset.phase !== 'ready') finish(true); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
const password = document.querySelector('#password');
const show = document.querySelector('.show-password');
show.addEventListener('click', () => {
  const visible = password.type === 'password';
  password.type = visible ? 'text' : 'password';
  show.textContent = visible ? 'Hide' : 'Show';
  show.setAttribute('aria-pressed', String(visible));
});
const feedback = document.querySelector('.feedback');
function inform(message) { feedback.hidden = false; feedback.textContent = message; }
document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  inform('You found the light! This is a local demo; no data was sent.');
});
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => inform(button.dataset.info)));
Promise.all(frames.map(image => image.decode().catch(() => {}))).then(() => {
  // A skip pressed while assets load must not restart the intro.
  if (scene.dataset.phase === 'loading') start();
});
