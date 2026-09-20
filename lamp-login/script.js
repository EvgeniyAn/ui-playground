'use strict';
const scene = document.querySelector('.scene');
const pull = document.querySelector('.pull');
const card = document.querySelector('.auth-card');
const form = document.querySelector('form');
const status = document.querySelector('.status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let lit = false;
let gesture = null;
let releaseAnimation = null;
let suppressClick = false;
let mode = 'signin';

function setLight(on) {
  lit = on;
  scene.dataset.lit = String(on);
  card.inert = !on;
  pull.setAttribute('aria-pressed', String(on));
  pull.setAttribute('aria-label', on ? 'Turn lamp off' : 'Turn lamp on');
  document.querySelector('#lamp-status').textContent = on ? 'Lamp on. Sign in form ready.' : 'Lamp off. Pull the cord to reveal the form.';
}

function releaseCord() {
  const offset = parseFloat(pull.style.getPropertyValue('--pull')) || 0;
  releaseAnimation?.cancel();
  pull.style.setProperty('--pull', '0px');
  if (!reducedMotion.matches && offset > 0) {
    releaseAnimation = pull.animate([{transform:`translateY(${offset * .2}px)`},{transform:'translateY(-4px)'},{transform:'translateY(0)'}], {duration:360,easing:'ease-out'});
  }
}

pull.addEventListener('pointerdown', event => {
  if (event.button !== 0 || gesture) return;
  releaseAnimation?.cancel();
  suppressClick = false;
  gesture = {id:event.pointerId, y:event.clientY, distance:0};
  pull.setPointerCapture(event.pointerId);
});
pull.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  gesture.distance = Math.max(0, Math.min(75, event.clientY - gesture.y));
  pull.style.setProperty('--pull', `${gesture.distance}px`);
});
pull.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  if (gesture.distance > 18) {setLight(!lit); suppressClick = true;}
  gesture = null;
  releaseCord();
});
function cancelPull() {if (gesture) suppressClick = true; gesture = null; releaseCord();}
pull.addEventListener('pointercancel', cancelPull);
pull.addEventListener('lostpointercapture', () => {if (gesture) cancelPull();});
pull.addEventListener('click', event => {
  if (suppressClick && event.detail !== 0) {suppressClick = false; return;}
  setLight(!lit);
});
document.querySelector('.lamp-area').addEventListener('wheel', event => {
  if (Math.abs(event.deltaY) > 8) setLight(event.deltaY > 0);
}, {passive:true});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {cancelPull(); setLight(false); pull.focus();}
});
document.querySelector('.replay').addEventListener('click', () => {
  cancelPull(); releaseAnimation?.cancel(); setLight(false); status.textContent = ''; pull.focus();
});

const tabs = [...document.querySelectorAll('[role=tab]')];
function selectMode(next) {
  mode = next;
  const signup = mode === 'signup';
  tabs.forEach((tab, index) => {const selected = index === Number(signup);tab.setAttribute('aria-selected',String(selected));tab.tabIndex = selected ? 0 : -1;});
  form.setAttribute('aria-labelledby', signup ? 'signup-tab' : 'signin-tab');
  document.querySelector('h1').textContent = signup ? 'Create Account' : 'Welcome Back';
  document.querySelector('.subtitle').textContent = signup ? 'A brighter start. Create your workspace.' : 'Please enter your details to sign in';
  document.querySelector('.name-field').hidden = !signup;
  document.querySelector('#name').disabled = !signup;
  document.querySelector('#name').required = signup;
  document.querySelector('#forgot').hidden = signup;
  document.querySelector('.remember').hidden = signup;
  document.querySelector('#password').autocomplete = signup ? 'new-password' : 'current-password';
  document.querySelector('.submit span').textContent = signup ? 'Create Account' : 'Sign In to Account';
  status.textContent = '';
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectMode(index ? 'signup' : 'signin'));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index;
    selectMode(next ? 'signup' : 'signin');tabs[next].focus();
  });
});
document.querySelector('.eye').addEventListener('click', event => {
  const input = document.querySelector('#password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  event.currentTarget.setAttribute('aria-label',show ? 'Hide password' : 'Show password');
  event.currentTarget.setAttribute('aria-pressed',String(show));
});
form.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = mode === 'signup' ? 'Your details are ready. This demo does not create an account.' : 'You’re all set! This is a local demo — no details were sent.';
});
document.querySelector('#forgot').addEventListener('click', () => {
  status.textContent = 'Password recovery is not connected in this demo.';
});
document.querySelectorAll('[data-provider]').forEach(button => button.addEventListener('click', () => {
  status.textContent = `${button.dataset.provider} sign-in is not connected in this demo.`;
}));
