"use client";

// Side panel for the studio — opens when an icon is selected in the grid,
// fetches that one SVG, lets the user dial in every prop and copy a
// snippet for the framework of their choice.
//
// SVG content is fetched lazily on selection: one `/svg/<name>.svg` per
// open, ~3 KB. The full content of all 235 icons never lives in the
// client bundle.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COLOR_VARS, ENGINES, ICON_ARCHETYPES, MOTIONS, PALETTES,
  SIGNATURE_INNER, TRIGGERS,
  type ColorVar, type Palette, type SignatureKey,
} from "../../lib/playground/data";
import { buildLiveSnippets, type SnippetBundle, type SnippetKey } from "../../lib/playground/snippets";
import type { StudioIconMeta } from "./types";

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

export function IconPanel({ icon, onClose }: { icon: StudioIconMeta; onClose: () => void }) {
  // Lazy-fetched raw SVG for this icon. ~3 KB per open.
  const [iconSvg, setIconSvg] = useState<string | null>(null);

  // Resettable per-instance prop state.
  const [previewSize, setPreviewSize] = useState(120);
  const [plain, setPlain] = useState(false);
  // Default noPetal=true to match the React wrapper default. The signature
  // mark is a deliberate accent — toggle off in the panel to reveal it.
  const [noPetal, setNoPetal] = useState(true);
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

  // Fetch the SVG when the icon changes.
  useEffect(() => {
    let cancelled = false;
    setIconSvg(null);
    fetch(`/svg/${icon.name}.svg`)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setIconSvg(text); })
      .catch(() => { if (!cancelled) setIconSvg(""); });
    return () => { cancelled = true; };
  }, [icon.name]);

  // Reset state + apply archetype on icon swap.
  useEffect(() => {
    const arch = ICON_ARCHETYPES[icon.name];
    if (arch) {
      setMotion(arch.motion);
      setEngineName(arch.engine ?? "css");
      setEmber(arch.ember ?? false);
      setRepeat(arch.repeat ?? "1");
      setRepeatDelay(arch.repeatDelay ?? "1.6");
      if (arch.speed) setSpeed(arch.speed);
    } else if (iconSvg) {
      setMotion(extractDefaultMotion(iconSvg) ?? "pop");
      setEngineName("css");
      setEmber(false);
      setRepeat("1");
      setRepeatDelay("1.6");
    }
    setPlain(false);
    setNoPetal(true);  // signature off by default — matches React wrapper
    setColors({});
    setSpark("nkonsonkonson");
  }, [icon.name, iconSvg]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hostRef = useRef<HTMLDivElement | null>(null);

  // Build the preview SVG with selected props applied.
  const previewSvg = useMemo(() => {
    if (!iconSvg) return "";
    let svg = iconSvg;
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
  }, [iconSvg, previewSize, plain, noPetal, spark]);

  // Wire data-attrs + hover trigger on the mounted SVG.
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

    // Speed + delay flow through CSS vars. icons.css animation rules read
    // `var(--ew-dur, default)` so this just works for the CSS engine.
    const svgEl = el as unknown as { style: CSSStyleDeclaration };
    if (speed) svgEl.style.setProperty("--ew-dur", speed);
    else svgEl.style.removeProperty("--ew-dur");
    if (delay) svgEl.style.setProperty("--ew-delay", delay);
    else svgEl.style.removeProperty("--ew-delay");

    // Apply colour overrides to the SVG element ITSELF, not the parent.
    // icons.css has `[data-theme] :where(.ew-icon) { --ew-glyph: ...; }`
    // — those rules set vars directly on the .ew-icon element and beat
    // any value the SVG would otherwise inherit from a parent div. So
    // putting our overrides on el (the SVG) is the only way to win.
    const svgStyle = (el as unknown as { style: CSSStyleDeclaration }).style;
    for (const v of COLOR_VARS) {
      const val = colors[v.name];
      if (val) svgStyle.setProperty(v.name, val);
      else svgStyle.removeProperty(v.name);
    }

    if (trigger === "hover") {
      el.removeAttribute("data-trigger");
      return;
    }
    const onEnter = () => el.setAttribute("data-play", "");
    const onLeave = () => el.removeAttribute("data-play");
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [previewSvg, engineName, motion, trigger, repeat, repeatDelay, ember, colors, speed, delay]);

  const snippets: SnippetBundle | null = useMemo(() => {
    if (!iconSvg) return null;
    return buildLiveSnippets({
      iconName: icon.name, iconSvg,
      motion, engineName, size: previewSize, ember, plain, noPetal, spark,
      speed, delay, trigger, repeat, repeatDelay, colors,
    });
  }, [icon.name, iconSvg, motion, engineName, previewSize, ember, plain, noPetal, spark, speed, delay, trigger, repeat, repeatDelay, colors]);

  return (
    <aside className="w-[420px] flex-shrink-0 self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded">
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
          className="flex items-center justify-center bg-[var(--color-bg)] border border-[var(--color-line)] rounded py-6 min-h-[140px]"
        >
          {previewSvg
            ? <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
            : <span className="text-xs font-mono text-[var(--color-ink-faint)]">Loading…</span>}
        </div>
      </div>

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

// ─────────── small atoms ───────────

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
  label: string; value: string; onChange: (v: string) => void;
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

// ─────────── settings + usage tab bodies ───────────

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
  snippets: SnippetBundle | null;
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
        {p.snippets ? (
          <UsageBlock
            title={FRAMEWORK_LABELS[p.copyFramework]}
            code={p.snippets[p.copyFramework]}
          />
        ) : null}
      </Section>
    </>
  );
}

function UsageTab({ snippets }: { snippets: SnippetBundle | null }) {
  const [active, setActive] = useState<SnippetKey>("react");
  const tabs = Object.keys(FRAMEWORK_LABELS) as SnippetKey[];
  if (!snippets) return <p className="text-[11px] font-mono text-[var(--color-ink-faint)]">Loading…</p>;
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
