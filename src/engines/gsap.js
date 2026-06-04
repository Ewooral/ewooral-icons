/*!
 * @ewooral/icons — GSAP engine (optional).
 * --------------------------------------------------------
 * Lazy-loads `gsap` only when an icon opts in via data-engine="gsap".
 * Targets the SAME hook classes the CSS keyframes use, so the visual
 * language stays identical — GSAP just gives finer timing control and
 * runs off the main thread of the CSS compositor.
 *
 * If gsap is not installed, we fall back to the CSS engine so nothing
 * breaks — the icon set never hard-depends on a runtime library.
 */
import * as cssEngine from './css.js';

var _gsapPromise = null;
function loadGsap() {
  if (_gsapPromise) return _gsapPromise;
  _gsapPromise = import('gsap')
    .then(function (m) {
      return m.gsap || m.default || m;
    })
    .catch(function () {
      return null;
    });
  return _gsapPromise;
}

// Map an icon's declared motion to a GSAP tween on the right hook node.
function buildTween(gsap, el, motion) {
  var body = el.querySelector('.ew-body') || el.querySelector('g') || el;
  var spark = el.querySelector('.ew-spark');
  var tl = gsap.timeline();

  switch (motion) {
    case 'shake':
      tl.to(body, {
        keyframes: { x: [0, -1.4, 1.4, -1, 1, 0] },
        duration: 0.5,
        ease: 'power1.inOut',
      });
      break;
    case 'swing':
      tl.to(body, {
        rotation: 12,
        transformOrigin: '50% 0%',
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
      break;
    case 'spin':
      tl.to(body, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 0.7,
        ease: 'power2.inOut',
      });
      break;
    case 'tilt':
      tl.to(body, {
        rotation: 8,
        transformOrigin: '50% 50%',
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
      break;
    case 'pulse':
      tl.to(body, {
        scale: 1.12,
        transformOrigin: '50% 50%',
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      });
      break;
    case 'pop':
    default:
      tl.fromTo(
        body,
        { scale: 0.86 },
        {
          scale: 1,
          transformOrigin: '50% 50%',
          duration: 0.45,
          ease: 'back.out(2.4)',
        }
      );
  }

  if (spark) {
    tl.fromTo(
      spark,
      { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(3)' },
      0
    ).to(spark, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0.35);
  }
  return tl;
}

export function play(el, opts) {
  opts = opts || {};
  if (el.hasAttribute('data-motion-off')) return;
  var motion = el.getAttribute('data-motion') || 'pop';

  loadGsap().then(function (gsap) {
    if (!gsap) {
      cssEngine.play(el, opts);
      return;
    } // graceful fallback
    if (el.__ewTl) el.__ewTl.kill();
    el.__ewTl = buildTween(gsap, el, motion);
  });
}

export function stop(el) {
  if (el.__ewTl) {
    el.__ewTl.kill();
    el.__ewTl = null;
  }
  // Clear any inline transforms GSAP left behind.
  loadGsap().then(function (gsap) {
    if (!gsap) return;
    var nodes = el.querySelectorAll('.ew-body, .ew-spark, g');
    gsap.set(nodes, { clearProps: 'all' });
  });
}

export default { play: play, stop: stop };
