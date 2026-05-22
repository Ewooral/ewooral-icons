/*!
 * @ewooral/icons — vanilla trigger helper
 * ---------------------------------------
 * Drop into any HTML page (Vue/Svelte/Solid/Angular/plain HTML — anything
 * that ships SVGs to the DOM). Auto-wires animation triggers on every
 * <svg class="ew-icon">.
 *
 * Usage:
 *   <link rel="stylesheet" href="@ewooral/icons/styles/icons.css">
 *   <script src="@ewooral/icons/vanilla/ew-icons-trigger.js" defer></script>
 *
 *   <!-- Default: hover. No data-trigger needed. -->
 *   <svg class="ew-icon" ...>...</svg>
 *
 *   <!-- Other triggers: declare via data-trigger -->
 *   <svg class="ew-icon" data-trigger="click">...</svg>
 *   <svg class="ew-icon" data-trigger="focus" tabindex="0">...</svg>
 *   <svg class="ew-icon" data-trigger="mount">...</svg>
 *   <svg class="ew-icon" data-trigger="viewport">...</svg>
 *
 *   <!-- Imperative trigger: dispatch the 'ew-play' custom event -->
 *   document.querySelector('.ew-icon').dispatchEvent(new CustomEvent('ew-play'));
 *
 * Triggers are wired on page load AND whenever new .ew-icon elements
 * are inserted into the DOM (MutationObserver).
 *
 * No dependencies, no bundler required, ~1 KB minified.
 */
(function () {
  "use strict";
  if (typeof document === "undefined") return; // SSR — no-op.

  // Parse a CSS time string ("0.7s", "500ms") to milliseconds.
  function toMs(v, fallback) {
    if (!v) return fallback;
    var m = String(v).trim().match(/^([\d.]+)(ms|s)$/);
    if (!m) return fallback;
    var n = parseFloat(m[1]);
    return m[2] === "ms" ? n : n * 1000;
  }

  // Force one play cycle on this icon. Honours --ew-iter / --ew-dur /
  // --ew-delay set inline or inherited.
  function play(el) {
    if (el.hasAttribute("data-motion-off")) return;
    el.removeAttribute("data-play");
    // Force reflow so re-adding the attr restarts the animation cleanly.
    void el.getBoundingClientRect();
    el.setAttribute("data-play", "");
    var cs = getComputedStyle(el);
    var iter = (cs.getPropertyValue("--ew-iter") || "1").trim();
    if (iter === "infinite") return; // don't auto-clear loops
    var dur = toMs((cs.getPropertyValue("--ew-dur") || "").trim(), 700);
    var dly = toMs((cs.getPropertyValue("--ew-delay") || "").trim(), 0);
    var iterNum = parseInt(iter, 10) || 1;
    var total = dur * iterNum + dly + 60;
    if (el.__ewTimer) clearTimeout(el.__ewTimer);
    el.__ewTimer = setTimeout(function () {
      el.removeAttribute("data-play");
      el.__ewTimer = null;
    }, total);
  }

  function stop(el) {
    if (el.__ewTimer) clearTimeout(el.__ewTimer);
    el.__ewTimer = null;
    el.removeAttribute("data-play");
  }

  // Wire one icon based on its data-trigger value.
  function wire(el) {
    if (el.__ewWired) return;
    el.__ewWired = true;

    // Imperative trigger via custom event — works for ALL triggers.
    el.addEventListener("ew-play", function () { play(el); });
    el.addEventListener("ew-stop", function () { stop(el); });

    var trig = el.getAttribute("data-trigger");
    if (!trig || trig === "hover") return; // CSS :hover handles it

    if (trig === "manual") return; // ew-play event only

    if (trig === "mount") {
      // Defer so element is fully styled (var values resolved).
      requestAnimationFrame(function () { play(el); });
      return;
    }

    if (trig === "click") {
      el.addEventListener("click", function () { play(el); });
      return;
    }

    if (trig === "focus") {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.addEventListener("focus", function () { play(el); });
      return;
    }

    if (trig === "viewport") {
      if (typeof IntersectionObserver === "undefined") {
        play(el);
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) play(el);
        }
      }, { threshold: 0.4 });
      io.observe(el);
      return;
    }
  }

  function wireAll(root) {
    var nodes = (root || document).querySelectorAll(".ew-icon");
    for (var i = 0; i < nodes.length; i++) wire(nodes[i]);
  }

  // Initial pass + observe future DOM mutations for SPAs that render
  // icons after the script has run.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { wireAll(); });
  } else {
    wireAll();
  }

  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.classList && n.classList.contains("ew-icon")) wire(n);
          if (n.querySelectorAll) wireAll(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // Expose helpers for explicit imperative use.
  window.EWIcons = {
    play: function (selOrEl) {
      var el = typeof selOrEl === "string" ? document.querySelector(selOrEl) : selOrEl;
      if (el) play(el);
    },
    stop: function (selOrEl) {
      var el = typeof selOrEl === "string" ? document.querySelector(selOrEl) : selOrEl;
      if (el) stop(el);
    },
    wireAll: wireAll,
  };
})();
