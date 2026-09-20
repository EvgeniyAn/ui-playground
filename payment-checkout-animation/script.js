(() => {
  'use strict';
  document.querySelectorAll('.checkout').forEach(checkout => {
    const $ = selector => checkout.querySelector(selector);
    const form = $('.payment-form');
    const card = $('.credit-card');
    const position = $('.card-position');
    const glow = $('.card-glow');
    const badges = $('.trust-badges');
    const ghosts = [...checkout.querySelectorAll('.ghost')];
    const processing = $('.processing-text');
    const success = $('.success-content');
    const replay = $('.replay');
    processing.hidden = true;
    const submit = $('.pay-button');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const savedAnimations = new Set();
    let state = 'form';
    const setState = next => { state = next; checkout.dataset.state = next; };
    const animate = (element, frames, duration, options = {}) => {
      const animation = element.animate(frames, { duration: reduced.matches ? 1 : duration, easing: 'cubic-bezier(.22,.75,.2,1)', fill: 'forwards', ...options });
      savedAnimations.add(animation);
      return animation.finished.catch(() => {});
    };
    const preview = (key,value) => { $(`[data-preview="${key}"]`).textContent = value; };
    form.addEventListener('input', event => {
      const input = event.target;
      const digits = input.value.replace(/\D/g,'');
      if(input.name === 'number') { input.value = digits.slice(0,16).replace(/(.{4})(?=.)/g,'$1 '); preview('number',input.value || '•••• •••• •••• ••••'); }
      if(input.name === 'holder') { input.setCustomValidity(input.value.trim() ? '' : 'Enter a cardholder name.'); preview('name',input.value.trim().toUpperCase() || 'YOUR NAME'); }
      if(input.name === 'expiry') { input.value = digits.slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2'); preview('expiry',input.value || 'MM/YY'); }
      if(input.name === 'cvv') { input.value = digits.slice(0,4); preview('cvv',input.value || '•••'); }
    });
    form.addEventListener('focusin', event => { if(state === 'form') card.classList.toggle('flipped',event.target.name === 'cvv'); });
    form.addEventListener('focusout', event => { if(event.target.name === 'cvv') card.classList.remove('flipped'); });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if(state !== 'form') return;
      setState('processing');
      processing.hidden = false;
      replay.disabled = true;
      checkout.setAttribute('aria-busy','true');
      submit.disabled = true;
      form.inert = true;
      card.classList.remove('flipped');
      // Wait for the real flip before moving the same card into the result view.
      await Promise.allSettled(card.getAnimations().map(animation => animation.finished));
      const mobile = matchMedia('(max-width:680px)').matches;
      const initialLeft = getComputedStyle(position).left;
      const initialTop = getComputedStyle(position).top;
      const targetLeft = mobile ? '50%' : '52.3%';
      await Promise.all([
        animate(form,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(36px)'}],350),
        animate(badges,[{opacity:1},{opacity:0}],250),
        ...ghosts.map(element => animate(element,[{opacity:getComputedStyle(element).opacity},{opacity:0}],350)),
        animate(position,[{left:initialLeft,top:initialTop},{left:targetLeft,top:mobile ? '70px' : '100px'}],650),
        animate(glow,[{opacity:0},{opacity:1}],600)
      ]);
      await animate(processing,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],220);
      // Deliberate simulated processing pause; there are no network/payment requests.
      await animate(glow,[{opacity:.7},{opacity:1},{opacity:.7},{opacity:1}],1500,{easing:'ease-in-out'});
      await animate(processing,[{opacity:1},{opacity:0}],180);
      processing.hidden = true;
      setState('success');
      success.hidden = false;
      await Promise.all([
        animate(success,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],500),
        animate($('.success-icon circle'),[{strokeDashoffset:170},{strokeDashoffset:0}],600),
        animate($('.success-icon path'),[{strokeDashoffset:42},{strokeDashoffset:0}],400,{delay:reduced.matches ? 0 : 200})
      ]);
      checkout.removeAttribute('aria-busy');
      replay.disabled = false;
      replay.focus({preventScroll:true});
    });
    $('.replay').addEventListener('click',async () => {
      if(state !== 'success') return;
      setState('resetting');
      await animate($('.checkout-body'),[{opacity:1},{opacity:0}],180);
      savedAnimations.forEach(animation => animation.cancel());
      savedAnimations.clear();
      success.hidden = true;
      processing.hidden = true;
      form.inert = false;
      submit.disabled = false;
      setState('form');
      await animate($('.checkout-body'),[{opacity:0},{opacity:1}],300);
      form.elements.holder.focus({preventScroll:true});
    });
  });
})();
