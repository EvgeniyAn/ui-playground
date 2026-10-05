(() => {
  "use strict";

  const ICONS = {
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M12 8.5v1.5M12 11.25v1.5M12 14v1.5"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.2 9.2.8 1.1 1.7 2.3 2.9 2.3s1.6-.7 3-.7 1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.7ZM14.1 5.8c.6-.8 1.1-1.8 1-2.9-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3Z"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4.5 10h11.5v4.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5Z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8.5 4.5V7M11 4.5V7M13.5 4.5V7"/></svg>'
  };

  const MARKS = {
    mastercard: '<svg class="mark mark--mastercard" viewBox="0 0 29 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#eb001b"/><circle cx="20" cy="9" r="9" fill="#f79e1b"/><path d="M14.5 1.9a9 9 0 0 1 0 14.2 9 9 0 0 1 0-14.2Z" fill="#ff5f00"/></svg>',
    apple: '<svg class="mark mark--apple" viewBox="3 2 17 21" fill="#111" aria-hidden="true"><path d="' + ICONS.apple.match(/d="([^"]+)"/)[1] + '"/></svg>',
    visa: '<span class="mark mark--visa" aria-hidden="true">VISA</span>'
  };

  const RECEIPTS = [
    {
      brand: "ticket", theme: "gold", radius: 12,
      title: "Thank you!", lines: ["Your ticket has been issued", "successfully"],
      idLabel: "Ticket ID", id: "0120034399434", amount: "$99.99", status: "Confirmed",
      mark: "mastercard", payer: "Alex Morgan", card: "•••• 8237",
      code: { type: "barcode", value: "2 8937261 273610" }
    },
    {
      brand: "apple", theme: "silver", radius: 14,
      title: "Apple Store", lines: ["Fifth Avenue · New York", "Receipt #AP-9842104"],
      idLabel: "Order No", id: "W984210491823", amount: "$1,199.00", status: "Paid in Full",
      mark: "apple", payer: "Alex Morgan", card: "Apple Pay (•••• 9012)",
      code: { type: "qr", value: "Scan to verify authenticity" }
    },
    {
      brand: "coffee", theme: "silver", radius: 3,
      title: "Artisan Roasters", lines: ["Fresh Brew & Bakery", "Table #08 · Order Ready"],
      idLabel: "Receipt #", id: "CF-84920418", amount: "$14.50", status: "Served",
      mark: "visa", payer: "Alex Morgan", card: "•••• 4192",
      code: { type: "barcode", value: "4 9281723 991824" }
    }
  ];

  const TIMING = {
    print: 1750,
    printEase: "cubic-bezier(0.3, 0.52, 0.36, 1)",
    badge: 520,
    beforeConfetti: 140,
    tug: 480,
    drop: 170,
    beforeNext: 420
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* Deterministic bars so each receipt keeps the same barcode */
  function barcodeSvg(seedText) {
    let seed = [...seedText].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    let x = 0;
    let rects = "";
    while (x < 120) {
      const width = random() < 0.55 ? 1 : random() < 0.6 ? 2 : 3;
      rects += `<rect x="${x}" width="${width}" height="1"/>`;
      x += width + (random() < 0.65 ? 1 : 2);
    }
    return `<svg class="barcode" viewBox="0 0 ${x - 1} 1" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">${rects}</svg>`;
  }

  function qrSvg() {
    const finder = (x, y) =>
      `<rect x="${x + 1.5}" y="${y + 1.5}" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="3"/><rect x="${x + 4.5}" y="${y + 4.5}" width="5" height="5" rx="1"/>`;
    const blocks = [
      [17.5, 1, 3, 6], [22, 3, 3, 3], [0, 18, 6, 3], [9, 18, 6, 3], [17.5, 18, 3, 3],
      [27, 18, 6, 3], [35, 18, 5, 3], [17.5, 23, 3, 10], [23, 26, 5, 3], [31, 26, 6, 3],
      [23, 34, 5, 5], [32, 34, 6, 5]
    ];
    return `<span class="qr" aria-hidden="true"><svg viewBox="0 0 40 40" fill="currentColor">${finder(0, 0)}${finder(26, 0)}${finder(0, 26)}${blocks
      .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.6"/>`)
      .join("")}</svg></span>`;
  }

  function createReceipt(data) {
    const receipt = document.createElement("article");
    receipt.className = "receipt";
    receipt.dataset.brand = data.brand;
    receipt.style.setProperty("--radius", `${data.radius}px`);
    receipt.setAttribute("aria-label", `${data.title} receipt`);
    const code =
      data.code.type === "qr"
        ? `<div class="receipt__code receipt__code--qr">${qrSvg()}<span>${data.code.value.toUpperCase()}</span></div>`
        : `<div class="receipt__code">${barcodeSvg(data.code.value)}<span>${data.code.value}</span></div>`;

    receipt.innerHTML = `
      <header class="receipt__head">
        <span class="receipt__badge" aria-hidden="true">${ICONS[data.brand]}</span>
        <h2 class="receipt__title">${data.title}</h2>
        <p class="receipt__subtitle">${data.lines.join("<br>")}</p>
      </header>
      <div class="receipt__tear" aria-hidden="true"><span></span></div>
      <dl class="receipt__grid">
        <div><dt>${data.idLabel}</dt><dd class="receipt__value--mono">${data.id}</dd></div>
        <div class="is-end"><dt>Amount</dt><dd class="receipt__amount">${data.amount}</dd></div>
        <div><dt>Date &amp; Time</dt><dd class="receipt__value">19 Aug 2026 · 20:17</dd></div>
        <div class="is-end"><dt>Status</dt><dd><span class="receipt__status">${data.status}</span></dd></div>
      </dl>
      <div class="receipt__method">
        ${MARKS[data.mark]}
        <span><strong>${data.payer}</strong><small>${data.card}</small></span>
      </div>
      ${code}
      <button class="receipt__action" type="button" disabled aria-label="Tear off the ${data.title} receipt and print the next one"></button>`;
    return receipt;
  }

  /* ---------- Confetti: one canvas shared by the page ---------- */

  const confetti = (() => {
    const canvas = document.querySelector(".confetti");
    const ctx = canvas.getContext("2d");
    const colors = ["#7c5cff", "#4f8bff", "#ff5fa2", "#22c55e", "#ffb020", "#ff7a45", "#38bdf8", "#a855f7", "#facc15"];
    let particles = [];
    let frame = 0;
    let last = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const drag = Math.pow(0.035, dt);
      particles = particles.filter((p) => {
        p.age += dt;
        if (p.age >= p.life) return false;
        p.vx *= drag;
        p.vy = p.vy * drag + 620 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.spin += p.spinSpeed * dt;
        p.flip += p.flipSpeed * dt;
        const fade = Math.min(1, (p.life - p.age) / (p.life * 0.4));
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      });
      frame = particles.length ? requestAnimationFrame(step) : 0;
    }

    resize();
    window.addEventListener("resize", resize);

    return {
      burst(x, y, count = 110) {
        for (let i = 0; i < count; i += 1) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.7;
          const speed = 380 + Math.random() * 820;
          particles.push({
            x: x + (Math.random() - 0.5) * 24,
            y: y + (Math.random() - 0.5) * 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 5 + Math.random() * 5,
            color: colors[(Math.random() * colors.length) | 0],
            shape: (Math.random() * 3) | 0,
            spin: Math.random() * Math.PI,
            spinSpeed: (Math.random() - 0.5) * 14,
            flip: Math.random() * Math.PI,
            flipSpeed: 6 + Math.random() * 10,
            age: 0,
            life: 1.3 + Math.random() * 0.9
          });
        }
        if (!frame) {
          last = performance.now();
          frame = requestAnimationFrame(step);
        }
      }
    };
  })();

  /* ---------- Printer component ---------- */

  class ReceiptPrinter {
    constructor(root) {
      this.root = root;
      this.printer = root.querySelector(".printer");
      this.path = root.querySelector("[data-paper-path]");
      this.statusText = root.querySelector("[data-status-text]");
      this.index = 0;
      this.receipt = null;
      this.busy = false;

      this.path.addEventListener("click", (event) => {
        if (event.target.closest(".receipt__action")) this.tearOff();
      });
      this.fit = this.fit.bind(this);
      window.addEventListener("resize", this.fit);
      this.fit();
      this.print();
    }

    fit() {
      const available = Math.max(0, document.documentElement.clientWidth - 32);
      this.root.style.setProperty("--fit", Math.min(1, available / 340).toFixed(4));
    }

    setStatus(status, message) {
      this.printer.dataset.status = status;
      this.statusText.textContent = message;
    }

    async print() {
      this.busy = true;
      const data = RECEIPTS[this.index];
      const receipt = createReceipt(data);
      const badge = receipt.querySelector(".receipt__badge");
      const action = receipt.querySelector(".receipt__action");
      const calm = reducedMotion.matches;

      this.receipt = receipt;
      this.printer.dataset.theme = data.theme;
      this.path.classList.remove("is-free");
      this.path.replaceChildren(receipt);
      this.setStatus("printing", `Printing the ${data.title} receipt…`);

      await receipt.animate(
        calm
          ? [{ transform: "none", opacity: 0 }, { transform: "none", opacity: 1 }]
          : [{ transform: "translateY(-101%)" }, { transform: "translateY(0)" }],
        { duration: calm ? 260 : TIMING.print, easing: calm ? "ease" : TIMING.printEase, fill: "forwards" }
      ).finished;

      await badge.animate(
        calm
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "scale(0.3)" },
              { opacity: 1, transform: "scale(1.14)", offset: 0.6 },
              { opacity: 1, transform: "scale(1)" }
            ],
        { duration: calm ? 200 : TIMING.badge, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)", fill: "forwards" }
      ).finished;

      if (!calm) {
        await wait(TIMING.beforeConfetti);
        const box = badge.getBoundingClientRect();
        confetti.burst(box.left + box.width / 2, box.top + box.height / 2);
      }

      this.setStatus("ready", `${data.title} receipt printed, ${data.amount}, ${data.status}. Press the receipt to tear it off.`);
      action.disabled = false;
      this.busy = false;
      if (this.root.contains(document.activeElement)) {
        action.focus({ preventScroll: true, focusVisible: false });
      }
    }

    async tearOff() {
      if (this.busy || !this.receipt) return;
      this.busy = true;
      const receipt = this.receipt;
      const hadFocus = receipt.contains(document.activeElement);
      receipt.querySelector(".receipt__action").disabled = true;
      const calm = reducedMotion.matches;

      // Keep the current pose as the starting frame, then release the clip
      receipt.getAnimations().forEach((animation) => {
        animation.commitStyles();
        animation.cancel();
      });
      this.path.classList.add("is-free");

      if (calm) {
        await receipt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).finished;
      } else {
        const origin = { transformOrigin: "50% 0" };
        await receipt.animate(
          [
            { ...origin, transform: "translate(0, 0) rotate(0deg)" },
            { ...origin, transform: "translate(5px, 16px) rotate(-4deg)" }
          ],
          { duration: TIMING.tug, easing: "cubic-bezier(0.2, 0.75, 0.3, 1)", fill: "forwards" }
        ).finished;
        await receipt.animate(
          [
            { ...origin, transform: "translate(5px, 16px) rotate(-4deg)", opacity: 1 },
            { ...origin, transform: "translate(14px, 96px) rotate(-8deg)", opacity: 0 }
          ],
          { duration: TIMING.drop, easing: "cubic-bezier(0.5, 0, 0.9, 0.5)", fill: "forwards" }
        ).finished;
      }

      receipt.remove();
      this.receipt = null;
      this.setStatus("printing", "Receipt torn off.");
      if (hadFocus) this.root.focus({ preventScroll: true });
      await wait(calm ? 150 : TIMING.beforeNext);
      this.index = (this.index + 1) % RECEIPTS.length;
      this.print();
    }
  }

  document.querySelectorAll("[data-receipt-printer]").forEach((root) => {
    root.tabIndex = -1;
    new ReceiptPrinter(root);
  });
})();
