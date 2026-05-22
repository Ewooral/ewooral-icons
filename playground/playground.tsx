import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/icons.css";
// Auto-wire vanilla trigger helper so data-trigger="click|focus|mount|viewport"
// works on the inline-SVG icons in the playground (which are dangerously
// inserted via innerHTML — i.e. NOT React-controlled).
import "../src/vanilla/ew-icons-trigger.js";

// Vite glob: pulls every .svg under src/svg as a raw string + hot-reloads
// on file change.
const SVG_MODULES = import.meta.glob<string>("../src/svg/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

type IconEntry = { name: string; svg: string };

const ICONS: IconEntry[] = Object.entries(SVG_MODULES)
  .map(([path, svg]) => ({
    name: path.split("/").pop()!.replace(/\.svg$/, ""),
    svg,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Theme = "dark" | "light" | "green";

// Default colour palette
const DEFAULT_FG = "";        // empty → inherit theme colour
const DEFAULT_ACCENT = "#f5b820";
const DEFAULT_BG = "";        // empty → subtle 7% currentColor tint

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(40);
  const [fg, setFg] = useState<string>(DEFAULT_FG);
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);
  const [bg, setBg] = useState<string>(DEFAULT_BG);
  const [showSpark, setShowSpark] = useState(true);
  const [plain, setPlain] = useState(false);
  // Motion: "1" (default), "infinite" (loop while hovered), "0" (off),
  // or any positive integer string.
  const [motion, setMotion] = useState<string>("1");
  // Animation duration (slower = bigger value). Default "0.7s" matches
  // the keyframe authors' intent.
  const [speed, setSpeed] = useState<string>("0.7s");
  // Delay before the animation starts after hover (also between
  // iterations when motion="infinite" because CSS resets at iteration 0).
  const [delay, setDelay] = useState<string>("0s");
  // Trigger mode — drives data-trigger attribute on every rendered icon.
  const [trigger, setTrigger] = useState<string>("hover");
  // Tick increments on "Play all" press to nudge useEffect on every card.
  const [playTick, setPlayTick] = useState(0);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^ew-/, "");
    if (!q) return ICONS;
    return ICONS.filter((i) => i.name.includes(q));
  }, [query]);

  return (
    <main style={{ minHeight: "100vh" }}>
      <header
        style={{
          padding: "32px 40px 24px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              fontFamily: "Bricolage Grotesque, system-ui",
            }}
          >
            @ewooral/icons
          </h1>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {ICONS.length} icons · hover any to see the motion
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: "1 1 220px",
              minWidth: 220,
              maxWidth: 360,
              background: "var(--bg-2)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              padding: "10px 14px",
              borderRadius: 4,
              outline: "none",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />

          <ThemeButton current={theme} value="dark" onClick={setTheme} label="Dark" />
          <ThemeButton current={theme} value="light" onClick={setTheme} label="Light" />
          <ThemeButton current={theme} value="green" onClick={setTheme} label="Company" />
        </div>

        {/* Colour pickers — the live "change to any colour" feature */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            padding: "12px 16px",
            background: "var(--bg-2)",
            borderRadius: 6,
            border: "1px solid var(--line)",
          }}
        >
          <ColorControl
            label="Glyph"
            value={fg}
            placeholder={"theme default"}
            onChange={setFg}
            onReset={() => setFg(DEFAULT_FG)}
          />
          <ColorControl
            label="Accent"
            value={accent}
            placeholder={DEFAULT_ACCENT}
            onChange={setAccent}
            onReset={() => setAccent(DEFAULT_ACCENT)}
          />
          <ColorControl
            label="Disc bg"
            value={bg}
            placeholder={"subtle tint"}
            onChange={setBg}
            onReset={() => setBg(DEFAULT_BG)}
          />

          <SelectControl
            label="Motion"
            value={motion}
            onChange={setMotion}
            options={[
              ["0", "Off"],
              ["1", "Play once"],
              ["2", "Play 2×"],
              ["3", "Play 3×"],
              ["5", "Play 5×"],
              ["infinite", "Repeat (loop)"],
            ]}
          />
          <SelectControl
            label="Speed"
            value={speed}
            onChange={setSpeed}
            options={[
              ["0.3s", "Fast (0.3s)"],
              ["0.5s", "Quick (0.5s)"],
              ["0.7s", "Normal (0.7s)"],
              ["1.2s", "Slow (1.2s)"],
              ["2s",   "Slower (2s)"],
              ["3s",   "Very slow (3s)"],
            ]}
          />
          <SelectControl
            label="Delay"
            value={delay}
            onChange={setDelay}
            options={[
              ["0s",    "None"],
              ["0.2s",  "200ms"],
              ["0.5s",  "500ms"],
              ["1s",    "1s"],
              ["2s",    "2s"],
            ]}
          />
          <SelectControl
            label="Trigger"
            value={trigger}
            onChange={setTrigger}
            options={[
              ["hover",    "Hover (default)"],
              ["click",    "Click / Tap"],
              ["focus",    "Focus"],
              ["mount",    "On mount"],
              ["viewport", "Enter viewport"],
              ["manual",   "Manual only"],
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setPlayTick((t) => t + 1);
              document.querySelectorAll<SVGElement>(".ew-icon").forEach((el) => {
                el.dispatchEvent(new CustomEvent("ew-play"));
              });
            }}
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              border: "1px solid var(--accent)",
              padding: "8px 14px",
              borderRadius: 4,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 600,
            }}
            title="Force every visible icon to play once"
          >
            ▶ Play all
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              htmlFor="sz"
              style={{
                fontSize: 11,
                color: "var(--ink-faint)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
                whiteSpace: "nowrap",
              }}
            >
              Size {size}
            </label>
            <input id="sz" type="range" min={16} max={120} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </div>

          <label
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "JetBrains Mono, monospace",
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" checked={showSpark} onChange={(e) => setShowSpark(e.target.checked)} />
            Petal
          </label>
          <label
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "JetBrains Mono, monospace",
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" checked={plain} onChange={(e) => setPlain(e.target.checked)} />
            Plain (no chrome)
          </label>

          <div
            style={{
              flex: "1 1 200px",
              minWidth: 200,
              fontSize: 11,
              color: "var(--ink-faint)",
              fontFamily: "JetBrains Mono, monospace",
              textAlign: "right",
            }}
          >
            Try presets:&nbsp;
            <PresetSwatch fg="" accent="#f5b820" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Default" />
            <PresetSwatch fg="#1a3a2a" accent="#f5b820" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Brand" />
            <PresetSwatch fg="#c0413a" accent="#f5b820" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Rose" />
            <PresetSwatch fg="#2a7a4a" accent="#f5e6a8" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Sage" />
            <PresetSwatch fg="#5a4ddb" accent="#ff5fa3" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Pop" />
            <PresetSwatch fg="#ffffff" accent="#ff6b00" onClick={(f, a) => { setFg(f); setAccent(a); }} title="Sunset" />
          </div>
        </div>
      </header>

      <section style={{ padding: 28 }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--ink-faint)", padding: 40, textAlign: "center" }}>
            No icons match “{query}”.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((icon) => (
              <IconCard
                key={icon.name}
                icon={icon}
                size={size}
                fg={fg}
                accent={accent}
                bg={bg}
                showSpark={showSpark}
                plain={plain}
                motion={motion}
                speed={speed}
                delay={delay}
                trigger={trigger}
                playTick={playTick}
              />
            ))}
          </div>
        )}
      </section>

      <footer
        style={{
          padding: "28px 40px",
          borderTop: "1px solid var(--line)",
          color: "var(--ink-dim)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Color customisation:</strong>{" "}
        every icon uses <code>currentColor</code> for the glyph (controllable via
        the <code>color</code> CSS prop) and <code>var(--ew-accent)</code> for
        the gold petal (controllable via the CSS variable). In React:{" "}
        <code>{`<Heart color="#c0413a" accent="#f5e6a8" />`}</code>. Click an
        icon to copy its name. Edits to <code>src/svg/*.svg</code> hot-reload.
      </footer>
    </main>
  );
}

function ThemeButton({
  current,
  value,
  onClick,
  label,
}: {
  current: Theme;
  value: Theme;
  onClick: (v: Theme) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      style={{
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--bg)" : "var(--ink-dim)",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        padding: "8px 14px",
        borderRadius: 4,
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: "JetBrains Mono, monospace",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

function ColorControl({
  label,
  value,
  placeholder,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <label
        style={{
          fontSize: 11,
          color: "var(--ink-faint)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "JetBrains Mono, monospace",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </label>
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          border: "1px solid var(--line)",
          borderRadius: 4,
          cursor: "pointer",
          background: "transparent",
        }}
        title={`${label} colour picker`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: 110,
          background: "var(--bg)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          padding: "6px 10px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          outline: "none",
        }}
      />
      <button
        type="button"
        onClick={onReset}
        style={{
          background: "transparent",
          color: "var(--ink-faint)",
          border: "none",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "4px 6px",
        }}
        title="Reset to default"
      >
        ↺
      </button>
    </div>
  );
}

function SelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<readonly [string, string]>;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <label
        style={{
          fontSize: 11,
          color: "var(--ink-faint)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg-2)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          padding: "6px 10px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          cursor: "pointer",
        }}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

function PresetSwatch({
  fg,
  accent,
  onClick,
  title,
}: {
  fg: string;
  accent: string;
  onClick: (fg: string, accent: string) => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(fg, accent)}
      title={title}
      style={{
        display: "inline-block",
        width: 22,
        height: 22,
        borderRadius: 4,
        marginLeft: 5,
        border: "1px solid var(--line)",
        cursor: "pointer",
        verticalAlign: "middle",
        background: `linear-gradient(135deg, ${fg || "var(--ink)"} 0 50%, ${accent} 50% 100%)`,
      }}
    />
  );
}

function IconCard({
  icon,
  size,
  fg,
  accent,
  bg,
  showSpark,
  plain,
  motion,
  speed,
  delay,
  trigger,
  playTick,
}: {
  icon: IconEntry;
  size: number;
  fg: string;
  accent: string;
  bg: string;
  showSpark: boolean;
  plain: boolean;
  motion: string;
  speed: string;
  delay: string;
  trigger: string;
  playTick: number;
}) {
  const [copied, setCopied] = useState(false);

  const cleaned = useMemo(() => {
    // Inject size + data-trigger on the outer <svg>.
    const trigAttr = trigger !== "hover" ? ` data-trigger="${trigger}"` : "";
    let svg = icon.svg.replace(
      /<svg([^>]*?)>/,
      `<svg$1 width="${size}" height="${size}"${trigAttr}>`,
    );
    if (plain) {
      // Plain mode: rip the entire chrome group. The non-greedy `.*?`
      // would stop at the nested ew-splash </g>; use a smarter scan
      // that finds the matching </g> by counting depth.
      svg = stripChrome(svg);
    } else if (!showSpark) {
      // Petal-only off (chrome still on) → strip the petal-ribbon path.
      svg = svg.replace(/<(circle|rect|path)[^>]*class="ew-spark"[^>]*\/>/g, "");
    }
    return svg;
  }, [icon.svg, size, showSpark, plain, trigger]);

  // After the cleaned SVG mounts, dispatch ew-play on every "Play all"
  // press (playTick bump). Skip first render unless trigger=mount, which
  // the vanilla helper already handles.
  const hostRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (playTick === 0) return;
    hostRef.current?.querySelector(".ew-icon")?.dispatchEvent(new CustomEvent("ew-play"));
  }, [playTick]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`ew-${icon.name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  // Apply chosen colours + motion via inline style + data attribute.
  // `color`        → currentColor (glyph + backdrop)
  // `--ew-accent`  → gold petal
  // `--ew-iter`    → animation iteration count
  // `--ew-dur`     → animation duration
  // `--ew-delay`   → animation delay
  const colourStyle: React.CSSProperties = {
    ...(fg ? { color: fg } : {}),
    ["--ew-accent" as never]: accent,
    ...(bg
      ? { ["--ew-bg" as never]: bg, ["--ew-bg-opacity" as never]: 1 }
      : {}),
    ["--ew-iter" as never]: motion === "0" ? "1" : motion,
    ["--ew-dur" as never]: speed,
    ["--ew-delay" as never]: delay,
  };
  const motionAttrs: Record<string, string> = motion === "0" ? { "data-motion-off": "" } : {};

  return (
    <button
      type="button"
      onClick={onCopy}
      title={`Copy "${icon.name}"`}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "20px 12px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        transition: "border-color 160ms ease, transform 160ms ease",
        color: "var(--ink)",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      <div
        ref={hostRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: size + 16,
          ...colourStyle,
        }}
        {...motionAttrs}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          color: copied ? "var(--accent)" : "var(--ink-dim)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {copied ? "copied!" : `ew-${icon.name}`}
      </span>
    </button>
  );
}

// Strip <g class="ew-chrome">...</g> respecting nested <g> elements
// (necessary because the chrome now contains the <g class="ew-splash">
// particle group, which means a non-greedy regex stops at the wrong tag).
function stripChrome(svg: string): string {
  const open = svg.indexOf('<g class="ew-chrome">');
  if (open === -1) return svg;
  let depth = 0;
  let i = open;
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

createRoot(document.getElementById("root")!).render(<App />);
