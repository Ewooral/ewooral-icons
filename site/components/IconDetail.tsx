"use client";
import { useState } from "react";
import { InlineIcon } from "./InlineIcon";

type Props = {
  name: string;
  displayName: string;
  pascal: string;
  motion: string | null;
  svg: string;
};

export function IconDetail(p: Props) {
  const [size, setSize] = useState(72);
  const [color, setColor] = useState("");
  const [accent, setAccent] = useState("#f5b820");
  const [bg, setBg] = useState("");
  const [plain, setPlain] = useState(false);
  const [trigger, setTrigger] = useState("hover");
  const [motion, setMotion] = useState("1");
  const [speed, setSpeed] = useState("0.7s");
  const [delay, setDelay] = useState("0s");
  const [playTick, setPlayTick] = useState(0);

  return (
    <div>
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
        {/* Preview */}
        <div>
          <p className="label-cap mb-3">{p.motion ? `motion: ${p.motion}` : "static"}</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-mono">
            <span className="text-[var(--color-accent)]">ew-</span>{p.name}
          </h1>
          <p className="text-[var(--color-ink-dim)] mb-8">
            React: <code className="font-mono text-[var(--color-ink)]">&lt;{p.pascal} /&gt;</code>
          </p>

          <div className="edge-card aspect-square bg-[var(--color-bg-2)] flex items-center justify-center mb-6 p-10">
            <InlineIcon
              svg={p.svg}
              size={size}
              color={color || undefined}
              accent={accent}
              bg={bg || undefined}
              plain={plain}
              motion={motion}
              speed={speed}
              delay={delay}
              trigger={trigger}
              playTick={playTick}
            />
          </div>

          <button
            onClick={() => setPlayTick((t) => t + 1)}
            className="w-full px-4 py-2.5 bg-[var(--color-accent)] text-[var(--color-bg)] rounded font-mono text-sm uppercase tracking-wider font-semibold hover:brightness-110 transition"
          >
            ▶ Play once
          </button>
        </div>

        {/* Controls + snippets */}
        <div className="space-y-6">
          <ControlBlock label="Size">
            <input type="range" min={24} max={160} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            <span className="label-cap">{size}px</span>
          </ControlBlock>
          <ControlBlock label="Trigger">
            <Select value={trigger} onChange={setTrigger}
              options={[["hover","Hover"],["click","Click"],["focus","Focus"],["mount","On mount"],["viewport","On scroll-in"],["manual","Manual only"]]} />
          </ControlBlock>
          <ControlBlock label="Motion plays">
            <Select value={motion} onChange={setMotion}
              options={[["off","Off"],["1","Once"],["2","2×"],["3","3×"],["5","5×"],["infinite","Repeat"]]} />
          </ControlBlock>
          <ControlBlock label="Speed">
            <Select value={speed} onChange={setSpeed}
              options={[["0.3s","Fast"],["0.5s","Quick"],["0.7s","Normal"],["1.2s","Slow"],["2s","Slower"],["3s","Very slow"]]} />
          </ControlBlock>
          <ControlBlock label="Delay">
            <Select value={delay} onChange={setDelay}
              options={[["0s","None"],["0.2s","200ms"],["0.5s","500ms"],["1s","1s"],["2s","2s"]]} />
          </ControlBlock>

          <div className="grid grid-cols-3 gap-4">
            <ColorPicker label="Glyph"  value={color}  onChange={setColor}  placeholder="inherit" />
            <ColorPicker label="Accent" value={accent} onChange={setAccent} placeholder="#f5b820" />
            <ColorPicker label="Disc bg" value={bg}    onChange={setBg}    placeholder="subtle tint" />
          </div>

          <label className="flex items-center gap-2 label-cap cursor-pointer">
            <input type="checkbox" checked={plain} onChange={(e) => setPlain(e.target.checked)} />
            Plain (no chrome)
          </label>

          {/* Snippets */}
          <Snippet label="React" code={generateReact(p, { size, color, accent, bg, plain, motion, speed, delay, trigger })} />
          <Snippet label="HTML (sprite)" code={`<svg class="ew-icon"${triggerAttr(trigger)} width="${size}" height="${size}">
  <use href="/path/to/sprite.svg#ew-${p.name}" />
</svg>`} />
          <Snippet label="Inline SVG path" code={`/* @ewooral/icons/svg/${p.name}.svg */`} />
        </div>
      </div>
    </div>
  );
}

function triggerAttr(trigger: string) {
  return trigger !== "hover" ? ` data-trigger="${trigger}"` : "";
}

function generateReact(p: Props, opts: {
  size: number; color: string; accent: string; bg: string;
  plain: boolean; motion: string; speed: string; delay: string; trigger: string;
}) {
  const props: string[] = [];
  if (opts.size !== 24) props.push(`size={${opts.size}}`);
  if (opts.color)  props.push(`color="${opts.color}"`);
  if (opts.accent && opts.accent !== "#f5b820") props.push(`accent="${opts.accent}"`);
  if (opts.bg)     props.push(`bg="${opts.bg}"`);
  if (opts.plain)  props.push(`plain`);
  if (opts.motion !== "1") {
    const motionVal = opts.motion === "infinite" ? `"repeat"` : opts.motion === "off" ? `"off"` : `{${opts.motion}}`;
    props.push(`motion=${motionVal}`);
  }
  if (opts.speed !== "0.7s") props.push(`speed="${opts.speed}"`);
  if (opts.delay !== "0s")   props.push(`delay="${opts.delay}"`);
  if (opts.trigger !== "hover") props.push(`trigger="${opts.trigger}"`);
  return `import { ${p.pascal} } from "@ewooral/icons/react";

<${p.pascal}${props.length ? " " + props.join(" ") : ""} />`;
}

function ControlBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="label-cap min-w-[80px]">{label}</span>
      <div className="flex-1 flex items-center gap-3">{children}</div>
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: Array<readonly [string, string]>;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="flex-1 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-3 py-2 text-sm font-mono">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function ColorPicker({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <p className="label-cap mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-2 py-1.5">
        <input type="color" value={value || "#ffffff"} onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 cursor-pointer bg-transparent border-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-xs font-mono outline-none" />
      </div>
    </div>
  );
}

function Snippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }
    catch { /* ignore */ }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label-cap">{label}</span>
        <button onClick={copy} className="label-cap hover:text-[var(--color-accent)] transition">
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded p-3 overflow-x-auto">
        <code className="text-xs font-mono text-[var(--color-ink-dim)] leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
