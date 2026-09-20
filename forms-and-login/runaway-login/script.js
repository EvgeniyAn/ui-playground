(() => {
  "use strict";

  class RunawayLogin {
    constructor(card) {
      this.card = card;
      this.form = card.querySelector("form");
      this.email = this.form.elements.email;
      this.password = this.form.elements.password;
      this.button = card.querySelector(".login-button");
      this.dock = card.querySelector(".dock");
      this.status = card.querySelector(".status-text");
      this.paths = card.querySelectorAll(".tether path");
      this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      this.finePointer = matchMedia("(hover: hover) and (pointer: fine)");
      this.x = this.y = this.rotation = 0;
      this.frame = 0;
      this.pointer = null;
      this.locked = false;
      this.keyboard = false;
      this.run = 0;
      this.signingAnimation = null;
      this.lastTime = 0;

      this.form.addEventListener("input", () => this.update());
      this.form.addEventListener("change", () => this.update());
      this.form.addEventListener("submit", event => this.submit(event));
      this.form.addEventListener("reset", () => {
        this.cancelSubmission();
        this.locked = false;
        this.keyboard = false;
        this.pointer = null;
        this.home(true);
        queueMicrotask(() => {
          this.password.type = "password";
          this.toggle.setAttribute("aria-label", "Show password");
          this.toggle.setAttribute("aria-pressed", "false");
          this.update();
          this.email.focus();
        });
      });
      this.card.addEventListener("pointermove", event => {
        if (event.pointerType !== "mouse") return;
        this.pointer = { x: event.clientX, y: event.clientY };
        this.wake();
      });
      this.card.addEventListener("pointerleave", () => {
        this.pointer = null;
        this.wake();
      });
      this.card.addEventListener("keydown", event => {
        if (event.key === "Tab" || event.key === "Enter" || event.key === " ") {
          this.keyboard = true;
          this.home(true);
        }
      });
      this.card.addEventListener("pointerdown", event => {
        this.keyboard = false;
        if (event.pointerType !== "mouse") this.home(true);
      });
      this.button.addEventListener("focus", () => this.home(true));
      this.button.addEventListener("blur", () => this.wake());
      this.toggle = card.querySelector(".visibility-button");
      this.toggle.addEventListener("click", () => {
        const visible = this.password.type === "password";
        this.password.type = visible ? "text" : "password";
        this.toggle.setAttribute("aria-pressed", String(visible));
        this.toggle.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      });
      const mediaChanged = () => {
        if (this.reducedMotion.matches || !this.finePointer.matches) this.home(true);
        if (this.reducedMotion.matches && this.signingAnimation) this.signingAnimation.finish();
      };
      this.reducedMotion.addEventListener("change", mediaChanged);
      this.finePointer.addEventListener("change", mediaChanged);
      this.resizeObserver = new ResizeObserver(() => this.home(true));
      this.resizeObserver.observe(this.dock);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { this.pointer = null; this.home(true); }
      });

      const dialog = card.querySelector("dialog");
      card.querySelectorAll("[data-info]").forEach(button => button.addEventListener("click", () => {
        card.querySelector(".dialog-copy").textContent = button.dataset.info === "forgot"
          ? "No password to recover here. Try any made-up email and a password of 8 or more characters to play the animation."
          : "No account needed. This is a local interaction demo — try any made-up email and a password of 8 or more characters.";
        dialog.showModal();
      }));
      card.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
      this.update();
    }

    validFields() {
      return [this.email.value.trim().length > 0 && this.email.validity.valid, this.password.value.length >= 8];
    }

    update() {
      if (this.card.dataset.phase === "submitting" || this.card.dataset.phase === "success") this.cancelSubmission();
      const validity = this.validFields();
      [this.email, this.password].forEach((input, index) => {
        input.closest(".field").dataset.valid = String(validity[index]);
        input.removeAttribute("aria-invalid");
        input.closest(".field").querySelector(".field-error").hidden = true;
      });
      this.count = validity.filter(Boolean).length;
      if (this.count === 2) this.locked = true;
      this.setPhase(this.count === 2 ? "ready" : this.count === 1 ? "partial" : "empty");
      this.wake();
    }

    setPhase(phase, message) {
      const messages = {
        empty: "Two fields to fill before it stands still.",
        partial: "One to go — it is slowing down.",
        ready: "Locked in. Go on then.",
        submitting: "Signing you in…",
        success: "Signed in."
      };
      this.card.dataset.phase = phase;
      this.status.textContent = message || messages[phase];
      this.button.setAttribute("aria-label", phase === "success" ? "Signed in" : phase === "submitting" ? "Signing you in" : "Log in");
      this.button.setAttribute("aria-busy", String(phase === "submitting"));
    }

    cancelSubmission() {
      this.run += 1;
      this.signingAnimation?.cancel();
      this.signingAnimation = null;
    }

    async submit(event) {
      event.preventDefault();
      if (["submitting", "success"].includes(this.card.dataset.phase)) return;
      this.home(true);
      const validity = this.validFields();
      if (validity.includes(false)) {
        const inputs = [this.email, this.password];
        inputs.forEach((input, index) => {
          input.setAttribute("aria-invalid", String(!validity[index]));
          input.closest(".field").querySelector(".field-error").hidden = validity[index];
        });
        this.status.textContent = "Check the fields above, then try again.";
        inputs[validity.indexOf(false)].focus();
        return;
      }
      this.locked = true;
      const run = ++this.run;
      this.setPhase("submitting");
      if (!this.reducedMotion.matches) {
        // One visible spinner cycle is the local demo's deliberate loading phase.
        const animation = this.card.querySelector(".spinner").animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(540deg)" }],
          { duration: 900, easing: "linear" }
        );
        this.signingAnimation = animation;
        try { await animation.finished; } catch { return; }
      }
      if (run !== this.run) return;
      this.signingAnimation = null;
      this.setPhase("success");
    }

    canChase() {
      return this.finePointer.matches && !this.reducedMotion.matches && !this.locked && !this.keyboard && document.activeElement !== this.button;
    }

    home(immediate = false) {
      if (!immediate) { this.wake(); return; }
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      this.x = this.y = this.rotation = 0;
      this.paint();
    }

    wake() {
      if (!this.frame) this.frame = requestAnimationFrame(time => this.tick(time));
    }

    tick(time) {
      const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, .032) : 1 / 60;
      this.lastTime = time;
      const rect = this.dock.getBoundingClientRect();
      const hw = this.button.offsetWidth / 2;
      const hh = this.button.offsetHeight / 2;
      const travel = this.count === 1 ? .5 : 1;
      const maxX = Math.max(0, rect.width / 2 - hw - 12) * travel;
      const maxY = Math.max(0, rect.height / 2 - hh - 8) * travel;
      let targetX = 0;
      let targetY = 0;
      if (this.canChase() && this.pointer) {
        const px = this.pointer.x - rect.left - rect.width / 2;
        const py = this.pointer.y - rect.top - rect.height / 2;
        if (Math.abs(px) < rect.width / 2 + 28 && Math.abs(py) < rect.height / 2 + 34) {
          const dx = this.x - px;
          const dy = this.y - py;
          const distance = Math.hypot(Math.max(Math.abs(dx) - hw, 0), Math.max(Math.abs(dy) - hh, 0));
          targetX = this.x;
          targetY = this.y;
          if (distance < 64) {
            const length = Math.hypot(dx, dy) || 1;
            const direction = dx === 0 ? (px <= 0 ? 1 : -1) : Math.sign(dx);
            const push = (64 - distance) * 2.3;
            const rawY = this.y + dy / length * push;
            const spill = Math.max(0, Math.abs(rawY) - maxY);
            targetX = this.x + (dx / length || direction * .45) * push + spill * .9 * direction;
            targetY = rawY;
          }
          targetX = Math.max(-maxX, Math.min(maxX, targetX));
          targetY = Math.max(-maxY, Math.min(maxY, targetY));
        }
      }
      const ease = 1 - Math.exp(-(this.locked ? 20 : 15) * dt);
      const previousX = this.x;
      this.x += (targetX - this.x) * ease;
      this.y += (targetY - this.y) * ease;
      const tilt = Math.max(-5, Math.min(5, (this.x - previousX) * .5 + this.x * .022));
      this.rotation += (tilt - this.rotation) * ease;
      const settled = Math.abs(targetX - this.x) + Math.abs(targetY - this.y) + Math.abs(tilt - this.rotation) < .06;
      if (settled) { this.x = targetX; this.y = targetY; }
      this.paint();
      this.frame = settled ? 0 : requestAnimationFrame(next => this.tick(next));
      if (settled) this.lastTime = 0;
    }

    paint() {
      this.button.style.transform = `translate3d(${this.x.toFixed(2)}px, ${this.y.toFixed(2)}px, 0) rotate(${this.rotation.toFixed(2)}deg)`;
      const cx = this.dock.clientWidth / 2;
      const cy = this.dock.clientHeight / 2;
      const bend = Math.min(10, Math.abs(this.x) * .08);
      const path = `M ${cx} ${cy} Q ${cx + this.x * .5} ${cy + this.y * .5 + bend} ${cx + this.x} ${cy + this.y}`;
      this.paths.forEach(element => element.setAttribute("d", path));
    }
  }

  document.querySelectorAll("[data-login]").forEach(card => {
    const login = new RunawayLogin(card);
    card.closest(".demo").querySelector(".replay").addEventListener("click", () => login.form.reset());
  });
})();
