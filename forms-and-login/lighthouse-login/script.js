(() => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const $ = (selector) => hero.querySelector(selector);
  const tower = $(".tower");
  const light = $("[data-light]");
  const bloom = $("[data-bloom]");
  const flare = $("[data-flare]");
  const flash = $("[data-flash]");
  const veil = $("[data-veil]");
  const card = $("[data-card]");
  const email = card.elements.email;
  const password = card.elements.password;
  const reveal = $("[data-reveal]");
  const submit = $("[data-submit]");
  const status = $("[data-status]");
  const replay = $("[data-replay]");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Timings measured from the reel (30 fps): the lamp turns from the left,
  // flashes toward the viewer at ~0.75 s, settles into a narrow beam to the
  // right by ~1.8 s; the card blurs in at ~2.8 s and is sharp ~0.25 s later.
  const INTRO_DELAY = 100;
  const LIGHT_DURATION = 1750;
  const HOLD_BEFORE_CARD = 900;
  const CARD_DURATION = 320;

  let generation = 0;
  let running = [];
  let submitTimer = 0;

  const animate = (element, keyframes, options) => {
    const animation = element.animate(keyframes, { fill: "backwards", ...options });
    running.push(animation);
    return animation;
  };

  const settle = (animations) => Promise.all(animations.map((a) => a.finished));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cancelRunning = () => {
    running.forEach((animation) => animation.cancel());
    running = [];
  };

  const setPhase = (phase) => {
    hero.dataset.phase = phase;
  };

  // On touch screens autofocus would pop the keyboard over the scene.
  const finePointer = window.matchMedia("(pointer: fine)");

  const focusEmail = () => {
    if (!finePointer.matches) return;
    if (!hero.contains(document.activeElement) || document.activeElement === replay) {
      email.focus({ preventScroll: true });
    }
  };

  const playLight = () => {
    const ease = "cubic-bezier(0.45, 0, 0.35, 1)";
    return [
      animate(tower, [{ opacity: 0 }, { opacity: 1 }], {
        delay: INTRO_DELAY - 40,
        duration: 140,
        easing: "ease-out",
      }),
      animate(
        light,
        [
          { offset: 0, opacity: 0, transform: "rotate(-170deg)", "--spread": "60deg" },
          { offset: 0.05, opacity: 1, transform: "rotate(-168deg)", "--spread": "70deg", easing: ease },
          { offset: 0.27, transform: "rotate(-150deg)", "--spread": "105deg", easing: ease },
          { offset: 0.4, transform: "rotate(-100deg)", "--spread": "300deg", easing: ease },
          { offset: 0.55, transform: "rotate(-48deg)", "--spread": "150deg", easing: ease },
          { offset: 0.75, transform: "rotate(-13deg)", "--spread": "46deg", easing: ease },
          { offset: 1, opacity: 1, transform: "rotate(-4deg)", "--spread": "26deg" },
        ],
        { delay: INTRO_DELAY, duration: LIGHT_DURATION }
      ),
      animate(
        bloom,
        [
          { offset: 0, opacity: 0, transform: "scale(0.6)" },
          { offset: 0.08, opacity: 0.9, transform: "scale(0.8)" },
          { offset: 0.4, opacity: 1, transform: "scale(1.9)" },
          { offset: 0.62, opacity: 1, transform: "scale(1.25)" },
          { offset: 1, opacity: 0.75, transform: "scale(1)" },
        ],
        { delay: INTRO_DELAY, duration: LIGHT_DURATION, easing: "ease-in-out" }
      ),
      animate(
        flash,
        [
          { offset: 0, opacity: 0 },
          { offset: 0.2, opacity: 0.06 },
          { offset: 0.38, opacity: 1 },
          { offset: 0.5, opacity: 0.62 },
          { offset: 0.68, opacity: 0.16 },
          { offset: 1, opacity: 0 },
        ],
        { delay: INTRO_DELAY, duration: LIGHT_DURATION, easing: "ease-in-out" }
      ),
      animate(
        flare,
        [
          { offset: 0, opacity: 0 },
          { offset: 0.2, opacity: 0.35 },
          { offset: 0.38, opacity: 1 },
          { offset: 0.52, opacity: 0.7 },
          { offset: 0.72, opacity: 0 },
          { offset: 1, opacity: 0 },
        ],
        { delay: INTRO_DELAY, duration: LIGHT_DURATION, easing: "ease-in-out" }
      ),
    ];
  };

  const playCard = (duration) => [
    animate(
      card,
      [
        { opacity: 0, filter: "blur(14px)" },
        { opacity: 1, filter: "blur(0px)" },
      ],
      { duration, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    ),
    animate(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: duration + 160, easing: "ease-out" }),
  ];

  const resetForm = () => {
    clearTimeout(submitTimer);
    submit.removeAttribute("aria-busy");
    submit.querySelector(".submit__label").textContent = "Sign in";
    setStatus("");
    [email, password].forEach((input) => input.removeAttribute("aria-invalid"));
  };

  async function runIntro() {
    const token = ++generation;
    cancelRunning();
    resetForm();

    if (reducedMotion.matches) {
      setPhase("reveal");
      try {
        await settle(playCard(200));
      } catch {
        return;
      }
      if (token !== generation) return;
      setPhase("ready");
      focusEmail();
      return;
    }

    setPhase("intro");
    try {
      await settle(playLight());
      if (token !== generation) return;
      await wait(HOLD_BEFORE_CARD);
      if (token !== generation) return;
      setPhase("reveal");
      await settle(playCard(CARD_DURATION));
    } catch {
      return; // cancelled by a replay
    }
    if (token !== generation) return;
    running = [];
    setPhase("ready");
    focusEmail();
  }

  /* ───────── Form ───────── */

  function setStatus(message, tone = "") {
    status.textContent = message;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  }

  reveal.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    reveal.textContent = show ? "Hide" : "Show";
    reveal.setAttribute("aria-pressed", String(show));
    reveal.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  reveal.setAttribute("aria-label", "Show password");

  // minlength only reports tooShort after user edits, so autofilled values are checked explicitly.
  const MIN_PASSWORD = 6;
  const isPasswordValid = () => password.value.length >= MIN_PASSWORD;
  const isValid = (input) => (input === password ? isPasswordValid() : input.validity.valid);

  [email, password].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && isValid(input)) {
        input.removeAttribute("aria-invalid");
        if (status.dataset.tone === "error") setStatus("");
      }
    });
  });

  hero.querySelectorAll("[data-demo-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setStatus("Demo only — there is no account service behind this page.");
    });
  });

  card.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submit.getAttribute("aria-busy") === "true") return;

    const problems = [];
    const emailOk = email.validity.valid;
    const passwordOk = isPasswordValid();
    email.setAttribute("aria-invalid", String(!emailOk));
    password.setAttribute("aria-invalid", String(!passwordOk));
    if (!emailOk) {
      problems.push(email.value ? "Enter a valid email address." : "Enter your email address.");
    }
    if (!passwordOk) {
      problems.push(password.value ? `Password must be at least ${MIN_PASSWORD} characters.` : "Enter your password.");
    }
    if (problems.length) {
      setStatus(problems[0], "error");
      (emailOk ? password : email).focus();
      return;
    }

    email.removeAttribute("aria-invalid");
    password.removeAttribute("aria-invalid");
    submit.setAttribute("aria-busy", "true");
    submit.querySelector(".submit__label").textContent = "Signing in…";
    setStatus("");

    submitTimer = setTimeout(() => {
      submit.removeAttribute("aria-busy");
      submit.querySelector(".submit__label").textContent = "Sign in";
      setStatus(`Signed in as ${email.value}. Nothing was sent — this is a demo.`, "success");
      if (!reducedMotion.matches) {
        bloom.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.45)", offset: 0.35 }, { transform: "scale(1)" }],
          { duration: 900, easing: "ease-in-out" }
        );
      }
    }, 1300);
  });

  replay.addEventListener("click", runIntro);

  runIntro();
})();
