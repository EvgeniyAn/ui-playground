'use strict';
(() => {
  const paths = {
    Documents: '<path d="M3 6h7l3 3h16v20H3z"/>',
    Photos: '<rect x="4" y="3" width="25" height="27" rx="1"/><path d="m8 25 6-9 5 6 3-4 4 7z" fill="currentColor" stroke="none"/>',
    Videos: '<circle cx="16" cy="16" r="14"/><path d="m13 9 10 7-10 7z" fill="currentColor" stroke="none"/>',
    Music: '<path d="M18 24V4h7v5h-7"/><ellipse cx="13" cy="25" rx="5" ry="5" fill="currentColor"/>',
    Files: '<path d="M6 2h15l7 8v21H6z"/><path d="M21 2v9h7M11 19h12M11 24h12"/>',
    Archive: '<rect x="4" y="4" width="25" height="26" rx="2"/><path d="M4 9h25M16.5 14v11m-5-5 5 5 5-5"/>',
    trash: '<path d="M7 9h18l-1 21H8zM5 6h22M12 6V3h8v3M13 13v12M19 13v12"/>'
  };
  const svg = name => `<svg viewBox="0 0 33 33" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${paths[name]}</svg>`;
  const folders = [['Documents',12,'#7e3edb'],['Photos',24,'#55b681'],['Videos',8,'#ee5d71'],['Music',18,'#7941de'],['Files',15,'#e6ae32'],['Archive',5,'#858892']];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  class DeleteDemo {
    constructor(root) {
      this.root = root;
      this.premium = root.classList.contains('premium');
      this.grid = root.querySelector('.grid');
      this.button = root.querySelector('.delete');
      this.status = root.querySelector('.status');
      this.animations = new Set();
      this.generation = 0;
      root.querySelectorAll('.trash-icon').forEach(el => el.innerHTML = svg('trash'));
      root.querySelector('.empty-icon').innerHTML = svg('Documents');
      this.grid.addEventListener('change', () => this.update());
      this.button.addEventListener('click', () => this.remove());
      root.querySelector('.replay').addEventListener('click', () => this.reset());
      root.addEventListener('keydown', event => {
        if (event.key === 'Escape') { this.cancel(); this.status.textContent = 'Animation cancelled.'; }
      });
      this.reset();
    }
    cancel() {
      this.generation++;
      cancelAnimationFrame(this.raf);
      this.animations.forEach(animation => animation.cancel());
      this.animations.clear();
      this.root.dataset.busy = 'false';
      this.grid.querySelectorAll('input').forEach(input => input.disabled = false);
      this.setProgress(0);
      this.update();
    }
    reset() {
      this.cancel();
      this.grid.innerHTML = folders.map(([name, count, color], index) => {
        if (!this.premium) color = ['#369bcd','#55b681','#e15865','#7941de','#e6ae32','#858892'][index];
        return `<label class="card" style="--icon:${color}"><input type="checkbox" aria-label="${name}"><span class="icon">${svg(name)}</span><strong>${name}</strong><small>${count} items</small></label>`;
      }).join('');
      this.root.querySelector('.empty').hidden = true;
      this.status.textContent = 'All six folders restored.';
      this.update();
    }
    update() {
      const count = this.grid.querySelectorAll(':checked').length;
      this.button.disabled = !count || this.root.dataset.busy === 'true';
      this.button.classList.toggle('show', count > 0);
      if (this.premium) this.root.querySelector('.count').textContent = count;
      if (this.root.dataset.busy !== 'true') this.status.textContent = `${count} folders selected.`;
    }
    setProgress(value) {
      if (!this.premium) return;
      this.root.querySelector('.progress b').textContent = `${value}%`;
      this.root.querySelector('.meter').style.strokeDashoffset = 100 - value;
    }
    animate(element, keyframes, options) {
      const animation = element.animate(keyframes, {fill: 'both', ...options});
      this.animations.add(animation);
      return animation;
    }
    async remove() {
      if (this.root.dataset.busy === 'true') return;
      const cards = [...this.grid.querySelectorAll('.card:has(:checked)')];
      if (!cards.length) return;
      const generation = ++this.generation;
      this.root.dataset.busy = 'true';
      this.grid.querySelectorAll('input').forEach(input => input.disabled = true);
      this.update();
      this.status.textContent = `Deleting ${cards.length} folders. Press Escape to cancel.`;
      try {
        if (this.premium && !reduced.matches) {
          const target = this.root.querySelector('.trash-circle').getBoundingClientRect();
          const duration = 1100;
          const clock = this.animate(this.root.querySelector('.meter'), [{strokeDashoffset:100},{strokeDashoffset:0}], {duration, easing:'linear'});
          const progress = () => {
            if (generation !== this.generation) return;
            this.root.querySelector('.progress b').textContent = `${Math.min(100, Math.round(Number(clock.currentTime || 0) / duration * 100))}%`;
            this.raf = requestAnimationFrame(progress);
          };
          progress();
          const flights = cards.map((card,index) => {
            const rect = card.getBoundingClientRect();
            const x = target.x + target.width/2 - rect.x - rect.width/2;
            const y = target.y + target.height/2 - rect.y - rect.height/2;
            return this.animate(card, [
              {transform:'translateY(-3px) scale(1)', opacity:1},
              {transform:`translate(${x*.2}px, ${y*.2}px) scale(.95) rotate(-4deg)`,opacity:1,offset:.3},
              {transform:`translate(${x}px, ${y}px) scale(.05) rotate(-12deg)`,opacity:0}
            ], {duration:540,delay:index*65,easing:'cubic-bezier(.55,0,.7,.45)'}).finished;
          });
          await Promise.all([...flights, clock.finished]);
          cancelAnimationFrame(this.raf);
        } else if (!reduced.matches) {
          await Promise.all(cards.map((card, index) => this.animate(card, [
            {transform: 'scale(1)', opacity: 1},
            {transform: 'scale(.94)', opacity: .85, offset: .35},
            {transform: 'scale(.65, 0)', opacity: 0}
          ], {
            duration: 560,
            delay: index * 55,
            easing: 'cubic-bezier(.4,0,.2,1)'
          }).finished));
        }
        if (generation !== this.generation) return;
        const oldRects = new Map([...this.grid.children].map(card => [card, card.getBoundingClientRect()]));
        const oldHeight = this.grid.getBoundingClientRect().height;
        const panel = this.root.querySelector('.panel');
        const oldPanelHeight = panel.getBoundingClientRect().height;
        cards.forEach(card => card.remove());
        this.animations.forEach(animation => animation.cancel());
        this.animations.clear();
        this.root.querySelector('.empty').hidden = this.grid.children.length > 0;
        if (!reduced.matches && this.grid.children.length) {
          const duration = this.premium ? 280 : 380;
          const moves = [...this.grid.children].map(card => {
            const old = oldRects.get(card), next = card.getBoundingClientRect();
            return this.animate(card,[{transform:`translate(${old.x-next.x}px,${old.y-next.y}px)`},{transform:'translate(0,0)'}],{duration,easing:'ease-out'}).finished;
          });
          const height = this.grid.getBoundingClientRect().height;
          moves.push(this.animate(this.grid,[{height:`${oldHeight}px`},{height:`${height}px`}],{duration,easing:'ease-out'}).finished);
          await Promise.all(moves);
        } else if (!this.premium && !reduced.matches) {
          const height = panel.getBoundingClientRect().height;
          await this.animate(panel, [{height:`${oldPanelHeight}px`},{height:`${height}px`}], {
            duration: 380, easing: 'ease-out'
          }).finished;
        }
        if (generation !== this.generation) return;
        this.animations.forEach(animation => animation.cancel());
        this.animations.clear();
        this.root.dataset.busy = 'false';
        this.grid.querySelectorAll('input').forEach(input => input.disabled = false);
        this.root.querySelector('.empty').hidden = this.grid.children.length > 0;
        this.setProgress(0);
        this.update();
        this.status.textContent = `${cards.length} folders moved to trash. ${this.grid.children.length} remaining.`;
        (this.grid.querySelector('input') || this.root.querySelector('.replay')).focus({preventScroll:true});
      } catch (error) {
        if (error.name !== 'AbortError') { this.cancel(); this.status.textContent = 'Please try again.'; console.error(error); }
      }
    }
  }
  document.querySelectorAll('.demo').forEach(root => new DeleteDemo(root));
})();
