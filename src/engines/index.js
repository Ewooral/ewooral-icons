/*!
 * @ewooral/icons — motion engine registry / dispatcher.
 * --------------------------------------------------------
 * One entry point that resolves which engine an icon should use and
 * forwards play()/stop() to it. Resolution order for a given element:
 *
 *   1. el[data-engine="css|gsap|motion"]            (per-icon override)
 *   2. nearest ancestor [data-ew-engine="..."]      (scope / app default)
 *   3. global default set via setDefaultEngine()    (defaults to 'css')
 *
 * The CSS engine is bundled directly (zero-dependency, always available).
 * GSAP and Motion are loaded through dynamic import() ONLY when first used,
 * so an app that never selects them ships no extra bytes. Unknown engine
 * names and failed imports both degrade gracefully to CSS.
 */
import * as css from './css.js';

export var ENGINES = ['css', 'gsap', 'motion'];

var _default = 'css';
export function setDefaultEngine(name) {
  if (ENGINES.indexOf(name) !== -1) _default = name;
}
export function getDefaultEngine() {
  return _default;
}

// Lazy adapters. css is eager; the others are imported on demand and cached.
var _cache = { css: Promise.resolve(css) };
function loadEngine(name) {
  if (_cache[name]) return _cache[name];
  var p;
  if (name === 'gsap') p = import('./gsap.js');
  else if (name === 'motion') p = import('./motion.js');
  else p = Promise.resolve(css);
  _cache[name] = p.catch(function () {
    return css;
  }); // degrade to css
  return _cache[name];
}

export function resolveEngine(el) {
  if (!el || !el.getAttribute) return _default;
  var own = el.getAttribute('data-engine');
  if (own && ENGINES.indexOf(own) !== -1) return own;
  var scope = el.closest ? el.closest('[data-ew-engine]') : null;
  if (scope) {
    var s = scope.getAttribute('data-ew-engine');
    if (s && ENGINES.indexOf(s) !== -1) return s;
  }
  return _default;
}

export function play(el, opts) {
  var name = resolveEngine(el);
  if (name === 'css') return css.play(el, opts); // sync fast-path, no await
  loadEngine(name).then(function (m) {
    (m.play || css.play)(el, opts);
  });
}

export function stop(el) {
  var name = resolveEngine(el);
  if (name === 'css') return css.stop(el);
  loadEngine(name).then(function (m) {
    (m.stop || css.stop)(el);
  });
}

// Optionally warm an engine ahead of time (e.g. on app boot).
export function preloadEngine(name) {
  return loadEngine(name);
}

export default {
  ENGINES: ENGINES,
  play: play,
  stop: stop,
  resolveEngine: resolveEngine,
  setDefaultEngine: setDefaultEngine,
  getDefaultEngine: getDefaultEngine,
  preloadEngine: preloadEngine,
};
