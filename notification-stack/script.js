(() => {
  'use strict';
  const notifications = [
    ['message', 'New Message', 'You have a new message from John.', '2m ago'],
    ['like', 'Someone Liked Your Post', 'Alex liked your photo.', '5m ago'],
    ['comment', 'New Comment', 'Sarah commented on your post.', '12m ago'],
    ['follower', 'New Follower', 'Mike started following you.', '18m ago']
  ];
  const icons = {
    message: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7M3 19l7-6m11 6-7-6" fill="none" stroke="#e8f0fd" stroke-width="1.3"/>',
    like: '<path d="M12 21C7 17 2 13 2 8a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 5-5 9-10 13Z"/>',
    comment: '<path d="M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>',
    follower: '<circle cx="12" cy="7" r="4.5"/><path d="M3 22v-3c0-8 18-8 18 0v3Z"/>'
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  class NotificationStack {
    constructor(root) {
      this.root = root;
      this.container = root.querySelector('.cards');
      this.premium = root.dataset.stack === 'premium';
      this.animations = new Set();
      this.version = 0;
      root.addEventListener('click', event => {
        const button = event.target.closest('.close');
        if (button) this.dismiss(button.closest('.card'));
      });
      this.reset();
    }
    reset() {
      this.cancel();
      this.container.replaceChildren(...notifications.map(([type, title, body, time]) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `<span class="icon ${type}" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[type]}</svg></span><div class="copy"><h3>${title}</h3><p>${body}</p></div><time>${time}</time><button class="close" type="button" aria-label="Dismiss ${title}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m2 2 12 12M14 2 2 14"/></svg></button>`;
        return card;
      }));
      this.update();
      this.root.querySelector('.status').textContent = '';
    }
    get cards() { return [...this.container.children]; }
    cancel() {
      this.version++;
      this.animations.forEach(animation => animation.cancel());
      this.animations.clear();
      this.busy = false;
      this.update();
    }
    async animate(element, frames, duration) {
      const animation = element.animate(frames, { duration: reduced.matches ? 0 : duration, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'both' });
      this.animations.add(animation);
      try { await animation.finished; } finally { this.animations.delete(animation); animation.cancel(); }
    }
    update() {
      const cards = this.cards;
      cards.forEach((card, i) => {
        const button = card.querySelector('.close');
        button.setAttribute('aria-disabled', String(this.busy));
        if (!this.premium) return;
        card.classList.toggle('front', i === 0);
        card.style.zIndex = 5 - i;
        card.style.transform = `translateY(${-i * 18}px) scale(${1 - i * .08})`;
        card.style.opacity = [1, .42, .23, .1][i];
        card.inert = i !== 0;
        card.setAttribute('aria-hidden', String(i !== 0));
      });
      this.root.querySelector('.empty').hidden = cards.length !== 0;
      if (this.premium) {
        const count = this.root.querySelector('.count');
        count.textContent = `+${Math.max(0, cards.length - 1)}`;
        count.hidden = cards.length < 2;
        this.root.querySelector('.dots').replaceChildren(...cards.map(() => document.createElement('span')));
      }
    }
    async dismiss(card) {
      if (this.busy || !card || !this.container.contains(card) || (this.premium && card !== this.cards[0])) return;
      this.busy = true;
      const version = this.version;
      const keyboard = card.contains(document.activeElement);
      this.update();
      try {
        await this.animate(card, [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(22px) scale(.94)', opacity: 0 }], this.premium ? 450 : 220);
        if (version !== this.version) return;
        const before = this.cards.filter(item => item !== card).map(item => ({ item, rect: item.getBoundingClientRect(), transform: item.style.transform, opacity: item.style.opacity }));
        const title = card.querySelector('h3').textContent;
        card.remove();
        this.update();
        await Promise.all(before.map(({ item, rect, transform, opacity }) => this.animate(item,
          this.premium ? [{ transform, opacity }, { transform: item.style.transform, opacity: item.style.opacity }] : [{ transform: `translateY(${rect.top - item.getBoundingClientRect().top}px)` }, { transform: 'translateY(0)' }], 360)));
        if (version !== this.version) return;
        this.root.querySelector('.status').textContent = `${title} dismissed. ${this.cards.length} notifications remaining.`;
        if (keyboard) (this.container.querySelector('.close') || document.querySelector('.replay')).focus({ preventScroll: true });
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      } finally {
        if (version === this.version) { this.busy = false; this.update(); }
      }
    }
  }
  const stacks = [...document.querySelectorAll('[data-stack]')].map(root => new NotificationStack(root));
  document.querySelector('.replay').addEventListener('click', () => stacks.forEach(stack => stack.reset()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stacks.forEach(stack => stack.cancel()); });
  reduced.addEventListener('change', () => stacks.forEach(stack => stack.animations.forEach(animation => animation.finish())));
})();
