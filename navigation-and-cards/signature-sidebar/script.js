(() => {
  "use strict";

  const WIDTHS = { expanded: 276, collapsed: 82 };
  const IS_APPLE = /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);

  function initSidebar(sidebar, { shortcut = false } = {}) {
    const stage = sidebar.closest(".stage") || document;
    const toggle = sidebar.querySelector("[data-toggle]");
    const toggleLabel = sidebar.querySelector("[data-toggle-label]");
    const searchRow = sidebar.querySelector(".search-row");
    const profileText = sidebar.querySelector(".profile__text");
    const search = sidebar.querySelector("[data-search]");
    const hint = sidebar.querySelector("[data-shortcut-hint]");
    const list = sidebar.querySelector("[data-nav]");
    const items = Array.from(list.querySelectorAll(".nav__item"));
    const pip = sidebar.querySelector("[data-pip]");
    const tooltip = sidebar.querySelector("[data-tooltip]");
    const chipState = stage.querySelector("[data-chip-state]");
    const chipWidth = stage.querySelector("[data-chip-width]");

    // Increments on every state change so stale async work (⌘K focus) can bail out.
    let stateToken = 0;

    if (!IS_APPLE) hint.textContent = "Ctrl K";

    const isCollapsed = () => sidebar.dataset.state === "collapsed";

    function setState(next) {
      const collapsed = next === "collapsed";

      // Focus must not disappear into a row that becomes inert.
      if (collapsed && searchRow.contains(document.activeElement)) toggle.focus();

      sidebar.dataset.state = next;
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggleLabel.textContent = collapsed ? "Expand sidebar" : "Collapse sidebar";
      searchRow.inert = collapsed;
      profileText.inert = collapsed;
      if (chipState) chipState.textContent = collapsed ? "Collapsed" : "Expanded";
      if (chipWidth) chipWidth.textContent = `${WIDTHS[next]}px`;
      hideTooltip();

      stateToken += 1;
      return stateToken;
    }

    // Resolves when the running width transition ends or is interrupted.
    function widthSettled() {
      const transitions = sidebar
        .getAnimations()
        .filter((animation) => animation.transitionProperty === "width");
      return Promise.all(transitions.map((animation) => animation.finished.catch(() => null)));
    }

    async function focusSearch() {
      if (isCollapsed()) {
        const token = setState("expanded");
        await widthSettled();
        if (token !== stateToken) return;
      }
      search.focus();
      search.select();
    }

    /* ---------- Active item and edge indicator ---------- */

    // Position is derived in CSS from the index, item height and gap, so it follows the resize too.
    function placePip(item, instant = false) {
      if (instant) pip.classList.add("is-instant");
      pip.style.setProperty("--pip-index", String(items.indexOf(item)));
      if (instant) {
        void pip.offsetWidth;
        pip.classList.remove("is-instant");
      }
    }

    function activate(item) {
      items.forEach((candidate) => {
        if (candidate === item) candidate.setAttribute("aria-current", "page");
        else candidate.removeAttribute("aria-current");
      });
      placePip(item);
    }

    list.addEventListener("click", (event) => {
      const item = event.target.closest(".nav__item");
      if (!item) return;
      event.preventDefault();
      activate(item);
    });

    list.addEventListener("keydown", (event) => {
      const index = items.indexOf(document.activeElement);
      if (index === -1) return;
      const targets = {
        ArrowDown: items[(index + 1) % items.length],
        ArrowUp: items[(index - 1 + items.length) % items.length],
        Home: items[0],
        End: items[items.length - 1],
      };
      const target = targets[event.key];
      if (!target) return;
      event.preventDefault();
      target.focus();
    });

    /* ---------- Compact-mode tooltip ---------- */

    function showTooltip(item) {
      if (!isCollapsed()) return;
      const sidebarBox = sidebar.getBoundingClientRect();
      const itemBox = item.getBoundingClientRect();
      tooltip.textContent = item.dataset.label;
      tooltip.style.setProperty("--tip-y", `${itemBox.top - sidebarBox.top + itemBox.height / 2}px`);
      tooltip.hidden = false;
    }

    function hideTooltip() {
      tooltip.hidden = true;
    }

    items.forEach((item) => {
      item.addEventListener("pointerenter", () => showTooltip(item));
      item.addEventListener("pointerleave", hideTooltip);
      item.addEventListener("focus", () => showTooltip(item));
      item.addEventListener("blur", hideTooltip);
    });

    /* ---------- Search ---------- */

    function matches() {
      const query = search.value.trim().toLowerCase();
      return items.filter((item) => query && item.dataset.label.toLowerCase().includes(query));
    }

    function highlightMatches() {
      const found = matches();
      items.forEach((item) => item.classList.toggle("is-match", found.includes(item)));
    }

    function clearSearch() {
      search.value = "";
      highlightMatches();
    }

    search.addEventListener("input", highlightMatches);

    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearSearch();
        search.blur();
      } else if (event.key === "Enter") {
        const [first] = matches();
        if (!first) return;
        event.preventDefault();
        activate(first);
        clearSearch();
        first.focus();
      }
    });

    /* ---------- Toggle and shortcut ---------- */

    toggle.addEventListener("click", () => {
      setState(isCollapsed() ? "expanded" : "collapsed");
    });

    if (shortcut) {
      document.addEventListener("keydown", (event) => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "k") return;
        event.preventDefault();
        focusSearch();
      });
    }

    // Initial state comes from the markup; sync ARIA, chip and the indicator without animation.
    setState(sidebar.dataset.state === "collapsed" ? "collapsed" : "expanded");
    placePip(items.find((item) => item.hasAttribute("aria-current")) || items[0], true);
  }

  document.querySelectorAll("[data-sidebar]").forEach((sidebar, index) => {
    initSidebar(sidebar, { shortcut: index === 0 });
  });
})();
