"use client";
import { useMemo, useRef, useEffect } from "react";

export type InlineIconProps = {
  svg: string;
  size?: number;
  color?: string;
  accent?: string;
  bg?: string;
  plain?: boolean;
  noPetal?: boolean;
  motion?: string;          // "1" | "infinite" | "off" | "3"
  speed?: string;
  delay?: string;
  trigger?: string;         // "hover" | "click" | "focus" | "mount" | "viewport" | "manual"
  playTick?: number;        // bump to dispatch "ew-play" on this icon
  className?: string;
};

/** Render a raw SVG string with live overrides (size, colours, motion).
 *  Used everywhere — browse cards, hero, per-icon detail, playground. */
export function InlineIcon(p: InlineIconProps) {
  const size = p.size ?? 28;
  const trigger = p.trigger ?? "hover";
  const motion = p.motion ?? "1";

  const html = useMemo(() => {
    const trigAttr = trigger !== "hover" ? ` data-trigger="${trigger}"` : "";
    let svg = p.svg.replace(
      /<svg([^>]*?)>/,
      `<svg$1 width="${size}" height="${size}"${trigAttr}>`,
    );
    if (p.plain) svg = stripChrome(svg);
    else if (p.noPetal) svg = svg.replace(/<(circle|rect|path)[^>]*class="ew-spark"[^>]*\/>/g, "");
    return svg;
  }, [p.svg, size, trigger, p.plain, p.noPetal]);

  const hostRef = useRef<HTMLSpanElement | null>(null);

  // Inline the play logic — set data-play, force reflow, schedule auto-
  // clear so the next call re-triggers from frame 0. The vanilla helper
  // does the same thing for non-React consumers; React needs its own
  // copy because the helper isn't loaded in the docs site bundle.
  const fire = (el: SVGElement) => {
    if (el.hasAttribute("data-motion-off")) return;
    el.removeAttribute("data-play");
    void el.getBoundingClientRect(); // force reflow
    el.setAttribute("data-play", "");
    const cs = getComputedStyle(el);
    const iter = (cs.getPropertyValue("--ew-iter") || "1").trim();
    if (iter === "infinite") return;
    const dur = parseTime(cs.getPropertyValue("--ew-dur"), 700);
    const dly = parseTime(cs.getPropertyValue("--ew-delay"), 0);
    const total = dur * (parseInt(iter, 10) || 1) + dly + 60;
    const timer = window.setTimeout(() => {
      el.removeAttribute("data-play");
    }, total);
    (el as unknown as { __ewTimer?: number }).__ewTimer && window.clearTimeout((el as unknown as { __ewTimer: number }).__ewTimer);
    (el as unknown as { __ewTimer?: number }).__ewTimer = timer;
  };

  // Programmatic "Play" — bump playTick to fire the icon's animation.
  useEffect(() => {
    if (!p.playTick || p.playTick === 0) return;
    const el = hostRef.current?.querySelector<SVGElement>(".ew-icon");
    if (el) fire(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.playTick]);

  // mount + viewport + click + focus triggers — same play logic.
  useEffect(() => {
    if (trigger === "hover" || trigger === "manual") return;
    const el = hostRef.current?.querySelector<SVGElement>(".ew-icon");
    if (!el) return;

    const play = () => fire(el);

    if (trigger === "mount") {
      requestAnimationFrame(play);
      return;
    }
    if (trigger === "click") {
      el.addEventListener("click", play);
      return () => el.removeEventListener("click", play);
    }
    if (trigger === "focus") {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.addEventListener("focus", play);
      return () => el.removeEventListener("focus", play);
    }
    if (trigger === "viewport") {
      if (typeof IntersectionObserver === "undefined") { play(); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) play(); });
      }, { threshold: 0.4 });
      io.observe(el);
      return () => io.disconnect();
    }
  }, [trigger, html]);

  const style: React.CSSProperties = {
    ...(p.color ? { color: p.color } : {}),
    ...(p.accent ? ({ ["--ew-accent" as never]: p.accent } as React.CSSProperties) : {}),
    ...(p.bg ? ({ ["--ew-bg" as never]: p.bg, ["--ew-bg-opacity" as never]: 1 } as React.CSSProperties) : {}),
    ["--ew-iter" as never]: motion === "off" ? "1" : motion,
    ...(p.speed ? ({ ["--ew-dur" as never]: p.speed } as React.CSSProperties) : {}),
    ...(p.delay ? ({ ["--ew-delay" as never]: p.delay } as React.CSSProperties) : {}),
  };
  const off = motion === "off" ? { "data-motion-off": "" } : {};

  return (
    <span
      ref={hostRef}
      className={p.className}
      style={style}
      {...off}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Parse a CSS time string ("0.7s" / "500ms") to milliseconds.
function parseTime(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const m = v.trim().match(/^([\d.]+)(ms|s)$/);
  if (!m) return fallback;
  const n = parseFloat(m[1]);
  return m[2] === "ms" ? n : n * 1000;
}

// Depth-counting strip — needed because chrome contains the nested splash group.
function stripChrome(svg: string): string {
  const open = svg.indexOf('<g class="ew-chrome">');
  if (open === -1) return svg;
  let depth = 0, i = open;
  while (i < svg.length) {
    if (svg.startsWith("<g", i)) { depth++; i = svg.indexOf(">", i) + 1; continue; }
    if (svg.startsWith("</g>", i)) {
      depth--;
      if (depth === 0) return svg.slice(0, open) + svg.slice(i + 4);
      i += 4; continue;
    }
    i++;
  }
  return svg;
}
