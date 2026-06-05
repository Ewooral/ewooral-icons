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
  // Load gsap core + MorphSVGPlugin in parallel; register Morph if present.
  // Morph is free as of GSAP 3.13 (Webflow transition). If it fails to load,
  // morph-based motions (e.g. "blink") fall back to scaleY squish via CSS.
  _gsapPromise = Promise.all([
    import('gsap'),
    import('gsap/MorphSVGPlugin').catch(function () {
      return null;
    }),
  ])
    .then(function (mods) {
      var gsap = mods[0].gsap || mods[0].default || mods[0];
      var morphMod = mods[1];
      var MorphPlugin =
        morphMod && (morphMod.MorphSVGPlugin || morphMod.default);
      if (MorphPlugin && gsap.registerPlugin) {
        gsap.registerPlugin(MorphPlugin);
      }
      return gsap;
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
  var splash = el.querySelectorAll('.ew-splash > *');
  // Loop config: data-repeat="-1" runs forever, data-repeat-delay="2"
  // inserts a 2s pause between iterations (natural for blink-style motions).
  var repeatAttr = el.getAttribute('data-repeat');
  var repeatDelayAttr = el.getAttribute('data-repeat-delay');
  var tlVars = {};
  if (repeatAttr !== null) tlVars.repeat = parseFloat(repeatAttr);
  if (repeatDelayAttr !== null)
    tlVars.repeatDelay = parseFloat(repeatDelayAttr);
  var tl = gsap.timeline(tlVars);

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
    case 'spin': {
      // When the timeline loops (data-repeat="-1"), behave like a loader:
      // linear ease, longer duration, no acceleration. One-shot spin keeps
      // the satisfying easeInOut.
      var spinIsLoop = repeatAttr !== null && parseFloat(repeatAttr) < 0;
      tl.to(body, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: spinIsLoop ? 1.1 : 0.7,
        ease: spinIsLoop ? 'none' : 'power2.inOut',
      });
      break;
    }
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
    case 'lid-open': {
      // Lifts the .ew-lid element + tilts it slightly to suggest a hinge
      // swing, holds briefly to "peek inside", then drops it back down.
      // Works for any container icon (archive, folder, gift, briefcase,
      // inbox) — just tag its lid element with class="ew-lid".
      var lid = el.querySelector('.ew-lid');
      if (lid) {
        tl.to(lid, {
          duration: 0.2,
          y: -2.8,
          rotation: -6,
          transformOrigin: 'left center',
          ease: 'power2.out',
        })
          .to(lid, { duration: 0.12 })           // hold open
          .to(lid, {
            duration: 0.24,
            y: 0,
            rotation: 0,
            ease: 'power3.in',
          });
      }
      break;
    }
    case 'tick': {
      // Rotate the .ew-tick-hand path around its base (assumed at the
      // path's d-start). Steps easing fires a discrete jump per frame
      // count — feels like a real second hand. Default cadence: one full
      // sweep over `speed`. Pair with motion="repeat" for continuous tick.
      var hand = el.querySelector('.ew-tick-hand');
      if (hand) {
        tl.to(hand, {
          duration: 4,
          rotation: 360,
          transformOrigin: '0 0',
          svgOrigin: '12 12.4',
          ease: 'steps(60)',
        });
      } else {
        // Fallback: rotate the whole body slowly.
        tl.to(body, {
          duration: 4,
          rotation: 360,
          transformOrigin: '50% 50%',
          ease: 'steps(60)',
        });
      }
      break;
    }
    case 'blink': {
      // Particle splash — gold dots burst outward from the spark position
      // during the close phase, fade out as the lid opens again. Each
      // .ew-splash circle moves to its own (dx, dy) target away from centre.
      if (splash && splash.length) {
        var dirs = [
          [-6, -6],
          [6, -7],
          [7, 4],
          [-7, 5],
          [0, -8],
        ];
        for (var i = 0; i < splash.length; i++) {
          var d = dirs[i % dirs.length];
          tl.fromTo(
            splash[i],
            { x: 0, y: 0, opacity: 1, scale: 1 },
            {
              x: d[0],
              y: d[1],
              opacity: 0,
              scale: 0.4,
              duration: 0.35,
              ease: 'power2.out',
            },
            0
          );
        }
      }

      // Real lid morph using MorphSVGPlugin. Requires the SVG body to carry:
      //   <path class="ew-blink-lid" data-blink-closed="<closed-d-path>"/>
      //   <g class="ew-blink-fade"> ... iris/pupil/highlight ... </g>
      // (currently authored on eye.svg). If the hooks aren't present we
      // degrade to a scaleY squish so the motion still fires gracefully.
      var lid = el.querySelector('.ew-blink-lid');
      var fade = el.querySelector('.ew-blink-fade');
      var closedD = lid && lid.getAttribute('data-blink-closed');
      var openD = lid && lid.getAttribute('d');
      if (lid && closedD && openD) {
        // 80ms close (eyelid snaps shut), 30ms shut hold, 170ms open (lifts
        // with tiny back-overshoot so it settles). Iris/pupil opacity-fade
        // in step with the lid so they don't peek through the closed lid.
        tl.to(
          lid,
          {
            duration: 0.08,
            morphSVG: closedD,
            ease: 'power3.in',
          },
          0
        )
          .to(
            fade,
            { duration: 0.07, opacity: 0, ease: 'power2.in' },
            0
          )
          .to({}, { duration: 0.03 }) // shut hold
          .to(lid, {
            duration: 0.17,
            morphSVG: openD,
            ease: 'back.out(1.4)',
          })
          .to(
            fade,
            { duration: 0.14, opacity: 1, ease: 'power2.out' },
            '<'
          );
      } else {
        // Fallback: vertical squeeze. Looks meh but doesn't 404.
        tl.to(body, {
          duration: 0.08,
          scaleY: 0.05,
          transformOrigin: '50% 50%',
          ease: 'power3.in',
        }).to(body, {
          duration: 0.17,
          scaleY: 1,
          ease: 'back.out(1.4)',
        });
      }
      break;
    }
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

// Ember emitter — spawns tiny <circle> particles at the spark's position
// and animates each rising upward + fading + scaling down. Runs at ~14
// particles/sec while attached; stop() shuts it down. SVG group is created
// once per icon and reused.
function startEmber(gsap, el) {
  if (el.__ewEmber) return; // already emitting
  var spark = el.querySelector('.ew-spark');
  if (!spark) return;
  // Use spark's bounding box to anchor the emitter.
  var bbox;
  try {
    bbox = spark.getBBox();
  } catch (e) {
    return;
  }
  var ex = bbox.x + bbox.width / 2;
  var ey = bbox.y + bbox.height / 2;
  var ns = 'http://www.w3.org/2000/svg';
  var group = document.createElementNS(ns, 'g');
  group.setAttribute('class', 'ew-ember');
  group.setAttribute('aria-hidden', 'true');
  // Insert just after spark so embers paint on top of chrome.
  spark.parentNode.appendChild(group);

  function emitOne() {
    var dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', ex + (Math.random() - 0.5) * 1.2);
    dot.setAttribute('cy', ey);
    dot.setAttribute('r', 0.35 + Math.random() * 0.35);
    dot.setAttribute('fill', 'var(--ew-accent, #f5b820)');
    group.appendChild(dot);
    gsap.to(dot, {
      y: -(3 + Math.random() * 3),
      x: (Math.random() - 0.5) * 1.5,
      opacity: 0,
      scale: 0.25,
      transformOrigin: '50% 50%',
      duration: 0.6 + Math.random() * 0.4,
      ease: 'power1.out',
      onComplete: function () {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      },
    });
  }

  // Bursty cadence so it feels alive, not metronomic.
  var iv = setInterval(function () {
    emitOne();
    if (Math.random() < 0.35) emitOne(); // occasional double
  }, 70);

  el.__ewEmber = {
    stop: function () {
      clearInterval(iv);
      // Let in-flight particles finish, then prune the group.
      setTimeout(function () {
        if (group.parentNode) group.parentNode.removeChild(group);
      }, 1100);
      el.__ewEmber = null;
    },
  };
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
    // If the icon opts into a fire-style emitter, start spewing embers.
    // data-ember="true" turns it on for any motion. The blink case turns
    // it on automatically (it shipped without; eye = fire by metaphor).
    if (motion === 'fire' || el.getAttribute('data-ember') === 'true') {
      startEmber(gsap, el);
    }
  });
}

export function stop(el) {
  if (el.__ewEmber) el.__ewEmber.stop();
  if (!el.__ewTl) return;
  var tl = el.__ewTl;
  el.__ewTl = null;
  // Rewind to the timeline's start state (restores morphed paths, opacity,
  // transforms, etc.), then kill. We deliberately DO NOT clearProps('all')
  // here — the previous version did, which wiped <g class="ew-body"> 's
  // own SVG-level `transform="translate(12 12.4)"` attribute and made the
  // glyph collapse to (0,0) on hover-out. progress(0) is enough.
  try {
    tl.progress(0).pause();
  } catch (_) {}
  tl.kill();
}

export default { play: play, stop: stop };
