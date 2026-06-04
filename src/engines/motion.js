/*!
 * @ewooral/icons — Motion engine (optional).
 * --------------------------------------------------------
 * Lazy-loads the `motion` package (motion.dev / Framer Motion's vanilla
 * `animate`) only when an icon opts in via data-engine="motion".
 * Targets the SAME hook classes as the CSS keyframes so the look matches.
 *
 * Falls back to the CSS engine when `motion` is not installed.
 */
import * as cssEngine from './css.js';

var _motionPromise = null;
function loadMotion() {
  if (_motionPromise) return _motionPromise;
  _motionPromise = import('motion')
    .then(function (m) {
      return m.animate ? m : m.default || m;
    })
    .catch(function () {
      return null;
    });
  return _motionPromise;
}

// Keyframes per motion, expressed the Motion way.
function framesFor(motion) {
  switch (motion) {
    case 'shake':
      return { keys: { x: [0, -1.4, 1.4, -1, 1, 0] }, opt: { duration: 0.5 } };
    case 'swing':
      return {
        keys: { rotate: [0, 12, 0] },
        opt: { duration: 0.44, transformOrigin: '50% 0%' },
      };
    case 'spin':
      return { keys: { rotate: [0, 360] }, opt: { duration: 0.7 } };
    case 'tilt':
      return { keys: { rotate: [0, 8, 0] }, opt: { duration: 0.36 } };
    case 'pulse':
      return { keys: { scale: [1, 1.12, 1] }, opt: { duration: 0.4 } };
    case 'pop':
    default:
      return {
        keys: { scale: [0.86, 1] },
        opt: { duration: 0.45, easing: [0.34, 1.56, 0.64, 1] },
      };
  }
}

export function play(el, opts) {
  opts = opts || {};
  if (el.hasAttribute('data-motion-off')) return;
  var motion = el.getAttribute('data-motion') || 'pop';

  loadMotion().then(function (lib) {
    if (!lib || !lib.animate) {
      cssEngine.play(el, opts);
      return;
    } // fallback
    var animate = lib.animate;
    var body = el.querySelector('.ew-body') || el.querySelector('g') || el;
    var spark = el.querySelector('.ew-spark');
    var f = framesFor(motion);

    if (el.__ewAnim)
      try {
        el.__ewAnim.stop();
      } catch (e) {}
    el.__ewAnim = animate(body, f.keys, f.opt);

    if (spark) {
      animate(
        spark,
        { scale: [0, 1, 1], opacity: [0, 1, 0] },
        { duration: 0.6 }
      );
    }
  });
}

export function stop(el) {
  if (el.__ewAnim) {
    try {
      el.__ewAnim.stop();
    } catch (e) {}
    el.__ewAnim = null;
  }
  var nodes = el.querySelectorAll('.ew-body, .ew-spark, g');
  nodes.forEach(function (n) {
    n.style.transform = '';
    n.style.opacity = '';
  });
}

export default { play: play, stop: stop };
