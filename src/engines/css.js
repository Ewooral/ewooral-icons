/*!
 * @ewooral/icons — CSS engine (default, zero-dependency).
 * --------------------------------------------------------
 * Drives animation purely via the [data-play] attribute contract that
 * src/styles/icons.css already listens for. No runtime libraries.
 * This is the canonical, smallest engine and the fallback for all others.
 */

function toMs(v, fallback) {
  var m = /^([\d.]+)(ms|s)?$/.exec((v || '').trim());
  if (!m) return fallback;
  var n = parseFloat(m[1]);
  return m[2] === 'ms' ? n : n * 1000;
}

// Run a single play cycle by toggling [data-play]. Honours the CSS
// custom props --ew-iter / --ew-dur / --ew-delay (inline or inherited).
export function play(el, opts) {
  opts = opts || {};
  if (el.hasAttribute('data-motion-off')) return;
  el.removeAttribute('data-play');
  // Force reflow so re-adding the attribute restarts the animation cleanly.
  void el.getBoundingClientRect();
  el.setAttribute('data-play', '');

  var cs = getComputedStyle(el);
  var iter = (cs.getPropertyValue('--ew-iter') || '1').trim();
  if (iter === 'infinite') return; // don't auto-clear loops

  var dur = toMs((cs.getPropertyValue('--ew-dur') || '').trim(), 700);
  var dly = toMs((cs.getPropertyValue('--ew-delay') || '').trim(), 0);
  var iterNum = parseInt(iter, 10) || 1;
  var total = dur * iterNum + dly + 60;

  if (el.__ewTimer) clearTimeout(el.__ewTimer);
  el.__ewTimer = setTimeout(function () {
    el.removeAttribute('data-play');
    el.__ewTimer = null;
  }, total);
}

export function stop(el) {
  if (el.__ewTimer) clearTimeout(el.__ewTimer);
  el.__ewTimer = null;
  el.removeAttribute('data-play');
}

export default { play: play, stop: stop };
