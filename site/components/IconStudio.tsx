"use client";

/**
 * IconStudio — the unified browse + test surface that replaces both the
 * old Next.js IconBrowser (grid + route-nav to detail) and the standalone
 * Vite playground. Same UX as localhost:5174 but built in Next.js so it
 * ships at icons.ewooral.com/icons.
 *
 * Layout: grid on the left, optional slide-in side panel on the right
 * when an icon is selected. Side panel mirrors the Vite playground's
 * SETTINGS / USAGE tabs feature-for-feature:
 *   - Engine / motion / trigger pickers
 *   - Size / speed / delay / repeat / repeatDelay
 *   - plain / noPetal / ember toggles
 *   - Signature swap (Nkonsonkonson / Adinkrahene / Sankofa / Petal)
 *   - 10-palette chip row
 *   - Per-var theme colour pickers
 *   - Copy snippet — 8 framework dropdown emitting live code
 *
 * Note: pulls engine scripts from "@ewooral/icons/dist/engines/index.js"
 * via dynamic import so the engine code only loads when an icon opens.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  COLOR_VARS, ENGINES, ICON_ARCHETYPES, MOTIONS, PALETTES,
  SIGNATURE_INNER, TRIGGERS,
  type ColorVar, type Palette, type SignatureKey,
} from "../lib/playground/data";
import { buildLiveSnippets, type SnippetBundle, type SnippetKey } from "../lib/playground/snippets";

type StudioIcon = {
  name: string;
  displayName: string;
  pascal: string;
  motion: string | null;
  svg: string;
};

const FRAMEWORK_LABELS: Record<SnippetKey, string> = {
  "react":        "React",
  "react-native": "React Native",
  "flutter":      "Flutter",
  "vue":          "Vue 3",
  "svelte":       "Svelte",
  "angular":      "Angular",
  "html-svg":     "Inline SVG",
  "html-img":     "<img> tag",
};

// ───────── helpers ─────────

function extractDefaultMotion(svg: string): string | null {
  const m = svg.match(/data-motion="([^"]+)"/);
  return m ? m[1] : null;
}

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

// ───────── component ─────────

export function IconStudio({ icons }: { icons: StudioIcon[] }) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(36);
  const [motionFilter, setMotionFilter] = useState("all");
  const [selected, setSelected] = useState<StudioIcon | null>(null);

  const allMotions = useMemo(() => {
    const set = new Set<string>();
    icons.forEach((i) => { if (i.motion) set.add(i.motion); });
    return Array.from(set).sort();
  }, [icons]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^ew-/, "");
    return icons.filter((i) => {
      if (term && !i.name.includes(term) && !i.pascal.toLowerCase().includes(term)) return false;
      if (motionFilter !== "all" && i.motion !== motionFilter) return false;
      return true;
    });
  }, [icons, query, motionFilter]);

  return (
    <div className="flex gap-6">
      {/* Grid — shrinks when the panel opens to leave room. */}
      <div className={selected ? "min-w-0 flex-1" : "w-full"}>
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons (e.g. heart, ew-arrow, cart)…"
            className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <label className="flex items-center gap-2 label-cap">
            Size {size}
            <input
              type="range"
              min={20}
              max={80}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 label-cap">
            Motion
            <select
              value={motionFilter}
              onChange={(e) => setMotionFilter(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-2 py-1 text-xs font-mono"
            >
              <option value="all">All</option>
              {allMotions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <span className="label-cap ml-auto">{filtered.length} shown</span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-ink-faint)] py-20">No icons match.</p>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${size + 50}px, 1fr))` }}
          >
            {filtered.map((icon) => (
              <button
                key={icon.name}
                type="button"
                onClick={() => setSelected(icon)}
                title={icon.displayName}
                className={`edge-card flex flex-col items-center gap-2 py-4 px-2 transition-colors group ${
                  selected?.name === icon.name
                    ? "bg-[var(--color-bg-3)] border-[var(--color-accent)]"
                    : "bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)]"
                }`}
              >
                <GridIcon svg={icon.svg} size={size} />
                <span className="text-[10px] font-mono text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-dim)] tracking-tight truncate max-w-full">
                  {icon.displayName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Side panel — opens when an icon is selected. */}
      {selected && (
        <DetailPanel
          icon={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ───────── grid cell renderer — static, no animation ─────────

function GridIcon({ svg, size }: { svg: string; size: number }) {
  const cleaned = useMemo(() => {
    return svg
      .replace(/<svg([^>]*?)>/, `<svg$1 width="${size}" height="${size}" data-motion-off="">`)
      .replace(/data-motion="[^"]*"/, 'data-motion="off"');
  }, [svg, size]);
  return <div dangerouslySetInnerHTML={{ __html: cleaned }} />;
}

// ───────── detail panel ─────────

function DetailPanel({ icon, onClose }: { icon: StudioIcon; onClose: () => void }) {
  // Resettable per-instance prop state.
  const [previewSize, setPreviewSize] = useState(120);
  const [plain, setPlain] = useState(false);
  const [noPetal, setNoPetal] = useState(false);
  const [ember, setEmber] = useState(false);
  const [motion, setMotion] = useState("pop");
  const [engineName, setEngineName] = useState("css");
  const [trigger, setTrigger] = useState("hover");
  const [repeat, setRepeat] = useState("1");
  const [repeatDelay, setRepeatDelay] = useState("1.6");
  const [speed, setSpeed] = useState("4.7s");
  const [delay, setDelay] = useState("0s");
  const [colors, setColors] = useState<Record<string, string>>({});
  const [spark, setSpark] = useState<SignatureKey>("nkonsonkonson");
  const [tab, setTab] = useState<"settings" | "usage">("settings");
  const [copyFramework, setCopyFramework] = useState<SnippetKey>("react");

  // Reset state on icon swap; apply archetype if defined.
  useEffect(() => {
    const arch = ICON_ARCHETYPES[icon.name];
    if (arch) {
      setMotion(arch.motion);
      setEngineName(arch.engine ?? "css");
      setEmber(arch.ember ?? false);
      setRepeat(arch.repeat ?? "1");
      setRepeatDelay(arch.repeatDelay ?? "1.6");
      if (arch.speed) setSpeed(arch.speed);
    } else {
      setMotion(extractDefaultMotion(icon.svg) ?? "pop");
      setEngineName("css");
      setEmber(false);
      setRepeat("1");
      setRepeatDelay("1.6");
    }
    setPlain(false);
    setNoPetal(false);
    setColors({});
    setSpark("nkonsonkonson");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icon.name]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hostRef = useRef<HTMLDivElement | null>(null);

  // Build the preview SVG with selected props applied.
  const previewSvg = useMemo(() => {
    let svg = icon.svg;
    svg = svg.replace(/<svg([^>]*?)>/, `<svg$1 width="${previewSize}" height="${previewSize}">`);
    if (plain) svg = stripChrome(svg);
    if (noPetal) {
      svg = svg.replace(/<g class="ew-signature"[\s\S]*?<\/g>/g, "");
    } else if (spark !== "nkonsonkonson") {
      svg = svg.replace(
        /(<g class="ew-signature"[^>]*>)[\s\S]*?(<\/g>)/,
        `$1${SIGNATURE_INNER[spark]}$2`,
      );
    }
    return svg;
  }, [icon.svg, previewSize, plain, noPetal, spark]);

  // After SVG mounts, wire data-attrs + hover trigger via the engines.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const el = host.querySelector(".ew-icon") as SVGElement | null;
    if (!el) return;
    el.setAttribute("data-engine", engineName);
    el.setAttribute("data-motion", motion);
    el.setAttribute("data-trigger", trigger);
    el.setAttribute("data-repeat", repeat);
    el.setAttribute("data-repeat-delay", repeatDelay);
    if (ember) el.setAttribute("data-ember", "true");
    else el.removeAttribute("data-ember");

    // Apply colour vars to the host style.
    for (const v of COLOR_VARS) {
      const val = colors[v.name];
      if (val) host.style.setProperty(v.name, val);
      else host.style.removeProperty(v.name);
    }

    // No JS engine wired here — the CSS engine fires animations via
    // :hover (when no data-trigger is set) or [data-play] (set by any
    // explicit trigger). For trigger="hover" the icon honours :hover
    // natively; for other triggers, we toggle data-play directly.
    const onEnter = () => el.setAttribute("data-play", "");
    const onLeave = () => el.removeAttribute("data-play");
    if (trigger === "hover") {
      // Strip data-trigger so the CSS :hover selector fires.
      el.removeAttribute("data-trigger");
    } else {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    }
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [previewSvg, engineName, motion, trigger, repeat, repeatDelay, ember, colors]);

  const snippets: SnippetBundle = useMemo(() => buildLiveSnippets({
    iconName: icon.name,
    iconSvg: icon.svg,
    motion, engineName, size: previewSize, ember, plain, noPetal, spark,
    speed, delay, trigger, repeat, repeatDelay, colors,
  }), [icon, motion, engineName, previewSize, ember, plain, noPetal, spark, speed, delay, trigger, repeat, repeatDelay, colors]);

  return (
    <aside
      className="w-[420px] flex-shrink-0 self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded"
    >
      {/* Sticky head — keeps the preview visible while scrolling. */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg-2)] px-5 pt-5 pb-4 border-b border-[var(--color-line)]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="label-cap mb-1">Selected</p>
            <h3 className="font-mono text-sm">{icon.displayName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink-dim)] text-lg leading-none p-1"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-[var(--color-line)] mb-3">
          <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>Settings</TabButton>
          <TabButton active={tab === "usage"} onClick={() => setTab("usage")}>Usage</TabButton>
        </div>

        <div
          ref={hostRef}
          className="flex items-center justify-center bg-[var(--color-bg)] border border-[var(--color-line)] rounded py-6"
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>

      {/* Tab body */}
      <div className="p-5 space-y-5">
        {tab === "settings" ? (
          <SettingsTab
            motion={motion} setMotion={setMotion}
            engineName={engineName} setEngineName={setEngineName}
            trigger={trigger} setTrigger={setTrigger}
            previewSize={previewSize} setPreviewSize={setPreviewSize}
            speed={speed} setSpeed={setSpeed}
            delay={delay} setDelay={setDelay}
            repeat={repeat} setRepeat={setRepeat}
            repeatDelay={repeatDelay} setRepeatDelay={setRepeatDelay}
            plain={plain} setPlain={setPlain}
            noPetal={noPetal} setNoPetal={setNoPetal}
            ember={ember} setEmber={setEmber}
            spark={spark} setSpark={setSpark}
            colors={colors} setColors={setColors}
            snippets={snippets}
            copyFramework={copyFramework}
            setCopyFramework={setCopyFramework}
          />
        ) : (
          <UsageTab snippets={snippets} />
        )}
      </div>
    </aside>
  );
}

// ───────── tabs ─────────

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] border-b-2 transition-colors ${
        active
          ? "border-[var(--color-accent)] text-[var(--color-accent)]"
          : "border-transparent text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

type SettingsTabProps = {
  motion: string; setMotion: (v: string) => void;
  engineName: string; setEngineName: (v: string) => void;
  trigger: string; setTrigger: (v: string) => void;
  previewSize: number; setPreviewSize: (v: number) => void;
  speed: string; setSpeed: (v: string) => void;
  delay: string; setDelay: (v: string) => void;
  repeat: string; setRepeat: (v: string) => void;
  repeatDelay: string; setRepeatDelay: (v: string) => void;
  plain: boolean; setPlain: (v: boolean) => void;
  noPetal: boolean; setNoPetal: (v: boolean) => void;
  ember: boolean; setEmber: (v: boolean) => void;
  spark: SignatureKey; setSpark: (v: SignatureKey) => void;
  colors: Record<string, string>; setColors: (v: Record<string, string>) => void;
  snippets: SnippetBundle;
  copyFramework: SnippetKey;
  setCopyFramework: (v: SnippetKey) => void;
};

function SettingsTab(p: SettingsTabProps) {
  return (
    <>
      <Section title="Engine & motion">
        <Select label="Engine" value={p.engineName} onChange={p.setEngineName}
          options={ENGINES.map((e) => [e, e])} />
        <Select label="Motion" value={p.motion} onChange={p.setMotion}
          options={MOTIONS.map((m) => [m, m])} />
        <Select label="Trigger" value={p.trigger} onChange={p.setTrigger}
          options={TRIGGERS.map((t) => [t, t])} />
      </Section>

      <Section title="Timing">
        <Range label={`Size ${p.previewSize}`} min={16} max={240} value={p.previewSize} onChange={p.setPreviewSize} />
        <Text label="Speed" value={p.speed} onChange={p.setSpeed} placeholder="4.7s" />
        <Text label="Delay" value={p.delay} onChange={p.setDelay} placeholder="0s" />
        <Text label="Repeat (-1 = ∞)" value={p.repeat} onChange={p.setRepeat} placeholder="1" />
        <Text label="Repeat delay" value={p.repeatDelay} onChange={p.setRepeatDelay} placeholder="1.6" />
      </Section>

      <Section title="Chrome">
        <Toggle label="plain (strip chrome)" value={p.plain} onChange={p.setPlain} />
        <Toggle label="noPetal (drop signature + splash)" value={p.noPetal} onChange={p.setNoPetal} />
        <Toggle label="ember emitter (data-ember)" value={p.ember} onChange={p.setEmber} />
        <Select
          label="Signature"
          value={p.spark}
          onChange={(v) => p.setSpark(v as SignatureKey)}
          options={[
            ["nkonsonkonson", "Nkonsonkonson (default, links)"],
            ["adinkrahene",   "Adinkrahene (concentric)"],
            ["sankofa",       "Sankofa (heart + spiral)"],
            ["petal",         "Petal (legacy)"],
          ]}
        />
      </Section>

      <Section title="Palette">
        <div className="flex flex-wrap gap-2 items-center">
          {PALETTES.map((pal: Palette) => (
            <button
              key={pal.name}
              type="button"
              title={pal.name}
              onClick={() => p.setColors(pal.colors)}
              className="w-7 h-7 rounded-full border border-[var(--color-line)] cursor-pointer transition-transform hover:scale-110"
              style={{
                background: `conic-gradient(${pal.swatches[0]} 0 33.33%, ${pal.swatches[1]} 33.33% 66.66%, ${pal.swatches[2]} 66.66% 100%)`,
              }}
            />
          ))}
        </div>
        <p className="text-[10px] font-mono text-[var(--color-ink-faint)] mt-2">
          Hover for name · click to apply
        </p>
      </Section>

      <Section title="Theme colour vars">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {COLOR_VARS.map((v: ColorVar) => (
            <ColorRow
              key={v.name}
              variable={v}
              value={p.colors[v.name] ?? v.default}
              overridden={p.colors[v.name] !== undefined}
              onChange={(val) => p.setColors({ ...p.colors, [v.name]: val })}
              onReset={() => {
                const next = { ...p.colors };
                delete next[v.name];
                p.setColors(next);
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => p.setColors({})}
          className="mt-3 w-full text-[10px] font-mono uppercase tracking-[0.18em] py-2 border border-[var(--color-line)] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] rounded"
        >
          Reset all colours
        </button>
      </Section>

      <Section title="Copy snippet">
        <Select
          label="Framework"
          value={p.copyFramework}
          onChange={(v) => p.setCopyFramework(v as SnippetKey)}
          options={(Object.keys(FRAMEWORK_LABELS) as SnippetKey[]).map((k) => [k, FRAMEWORK_LABELS[k]])}
        />
        <UsageBlock
          title={FRAMEWORK_LABELS[p.copyFramework]}
          code={p.snippets[p.copyFramework]}
        />
      </Section>
    </>
  );
}

function UsageTab({ snippets }: { snippets: SnippetBundle }) {
  const [active, setActive] = useState<SnippetKey>("react");
  const tabs = Object.keys(FRAMEWORK_LABELS) as SnippetKey[];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 p-1 bg-[var(--color-bg)] border border-[var(--color-line)] rounded">
        {tabs.map((k) => {
          const on = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setActive(k)}
              className={`flex-1 px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] rounded transition-colors ${
                on
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              }`}
            >
              {FRAMEWORK_LABELS[k]}
            </button>
          );
        })}
      </div>
      <UsageBlock title={FRAMEWORK_LABELS[active]} code={snippets[active]} />
    </div>
  );
}

// ───────── form atoms ─────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--color-ink-faint)] pt-3 pb-1.5 mb-2 border-b border-[var(--color-line)]">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="label-cap flex-shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-2 py-1.5 text-xs font-mono"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Text({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="label-cap flex-shrink-0">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-2 py-1.5 text-xs font-mono"
      />
    </div>
  );
}

function Range({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="label-cap flex-shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer">
      <span className="label-cap">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--color-accent)]"
      />
    </label>
  );
}

function ColorRow({ variable, value, onChange, onReset, overridden }: {
  variable: ColorVar;
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  overridden: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] font-mono tracking-tight text-[var(--color-ink-faint)] mb-0.5">
        {variable.label}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-6 cursor-pointer bg-transparent border border-[var(--color-line)] rounded"
          style={{ padding: 0 } as CSSProperties}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-1.5 py-0.5 text-[10px] font-mono"
        />
        {overridden && (
          <button
            type="button"
            onClick={onReset}
            title="Reset"
            className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] border border-[var(--color-line)] rounded"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}

function UsageBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
          {title}
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1100);
          }}
          className={`text-[10px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 border border-[var(--color-line)] rounded ${
            copied ? "text-[var(--color-accent)]" : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="bg-[var(--color-bg)] border border-[var(--color-line)] rounded p-3 m-0 text-[11px] font-mono text-[var(--color-ink-dim)] leading-snug overflow-y-auto max-h-[420px]"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "hidden" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
