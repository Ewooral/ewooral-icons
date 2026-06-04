/*!
 * @ewooral/icons — React wrapper with a pluggable `engine` prop.
 * --------------------------------------------------------
 * Mirrors how icons work in vanilla, but lets React users pick the motion
 * engine declaratively:
 *
 *   import { EwIcon } from '@ewooral/icons/react';
 *   <EwIcon name="star" engine="gsap" trigger="hover" />
 *
 * engine: 'css' (default, zero-dependency) | 'gsap' | 'motion'
 * The chosen engine is passed straight through as data-engine, so the same
 * resolution logic the vanilla trigger uses applies. gsap / motion are
 * lazy-loaded only when actually played, and fall back to CSS if absent.
 *
 * NOTE: this file lives next to the vanilla helper for the StackBlitz demo;
 * in the published package it is exported from '@ewooral/icons/react'.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import * as engine from '../engines/index.js';

export function EwIcon(props) {
  var name = props.name;
  var eng = props.engine || 'css';
  var trigger = props.trigger || 'hover';
  var size = props.size || 24;
  var className = props.className || '';
  var children = props.children; // raw <path>/<g> markup for this glyph
  var rest = {};
  Object.keys(props).forEach(function (k) {
    if (
      ['name', 'engine', 'trigger', 'size', 'className', 'children'].indexOf(
        k
      ) === -1
    )
      rest[k] = props[k];
  });

  var ref = useRef(null);

  var play = useCallback(function () {
    if (ref.current) engine.play(ref.current);
  }, []);
  var stop = useCallback(function () {
    if (ref.current) engine.stop(ref.current);
  }, []);

  // Mount / viewport / manual triggers handled here; hover/click/focus use
  // native React handlers below so they work without the global script.
  useEffect(
    function () {
      var el = ref.current;
      if (!el) return;
      if (trigger === 'mount') {
        var raf = requestAnimationFrame(play);
        return function () {
          cancelAnimationFrame(raf);
        };
      }
      if (
        trigger === 'viewport' &&
        typeof IntersectionObserver !== 'undefined'
      ) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) play();
          });
        });
        io.observe(el);
        return function () {
          io.disconnect();
        };
      }
    },
    [trigger, play]
  );

  var handlers = {};
  if (trigger === 'hover') {
    handlers.onMouseEnter = play;
    handlers.onMouseLeave = stop;
  } else if (trigger === 'click') {
    handlers.onClick = play;
  } else if (trigger === 'focus') {
    handlers.onFocus = play;
    handlers.tabIndex = rest.tabIndex != null ? rest.tabIndex : 0;
  }

  return React.createElement(
    'svg',
    Object.assign(
      {
        ref: ref,
        className: ('ew-icon ' + className).trim(),
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        'data-motion': props['data-motion'] || 'pop',
        'data-engine': eng,
        'data-name': name,
        'aria-hidden': props['aria-label'] ? undefined : true,
        role: props['aria-label'] ? 'img' : undefined,
      },
      handlers,
      rest
    ),
    children
  );
}

export default EwIcon;
