"use client";
import { useMemo, useState } from "react";
import { InlineIcon } from "./InlineIcon";

type IconRecord = { name: string; displayName: string; pascal: string; motion: string | null; svg: string };

export function Playground({ icons }: { icons: IconRecord[] }) {
  const [q, setQ] = useState("");
  const [size, setSize] = useState(44);
  const [color, setColor] = useState("");
  const [accent, setAccent] = useState("#f5b820");
  const [bg, setBg] = useState("");
  const [plain, setPlain] = useState(false);
  const [trigger, setTrigger] = useState("hover");
  const [motion, setMotion] = useState("1");
  const [speed, setSpeed] = useState("0.7s");
  const [delay, setDelay] = useState("0s");
  const [playTick, setPlayTick] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^ew-/, "");
    return icons.filter((i) => !term || i.name.includes(term) || i.pascal.toLowerCase().includes(term));
  }, [icons, q]);

  return (
    <div>
      {/* Sticky control bar */}
      <div className="sticky top-14 z-40 -mx-6 px-6 py-4 mb-6 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-line)]">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="flex-1 min-w-[200px] max-w-xs bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <Select label="Trigger" value={trigger} onChange={setTrigger}
            options={[["hover","Hover"],["click","Click"],["focus","Focus"],["mount","On mount"],["viewport","On scroll"],["manual","Manual"]]} />
          <Select label="Motion" value={motion} onChange={setMotion}
            options={[["off","Off"],["1","Once"],["2","2×"],["3","3×"],["5","5×"],["infinite","Repeat"]]} />
          <Select label="Speed" value={speed} onChange={setSpeed}
            options={[["0.3s","Fast"],["0.5s","Quick"],["0.7s","Normal"],["1.2s","Slow"],["2s","Slower"],["3s","Very slow"]]} />
          <Select label="Delay" value={delay} onChange={setDelay}
            options={[["0s","None"],["0.2s","200ms"],["0.5s","500ms"],["1s","1s"],["2s","2s"]]} />
          <label className="flex items-center gap-2 label-cap">
            Size {size}
            <input type="range" min={24} max={96} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>
          <ColorPicker label="Glyph"   value={color}  onChange={setColor}  placeholder="inherit" />
          <ColorPicker label="Accent"  value={accent} onChange={setAccent} placeholder="#f5b820" />
          <ColorPicker label="Disc bg" value={bg}     onChange={setBg}     placeholder="subtle" />
          <label className="flex items-center gap-2 label-cap cursor-pointer">
            <input type="checkbox" checked={plain} onChange={(e) => setPlain(e.target.checked)} />
            Plain
          </label>
          <button
            onClick={() => setPlayTick((t) => t + 1)}
            className="px-4 py-1.5 bg-[var(--color-accent)] text-[var(--color-bg)] rounded font-mono text-xs uppercase tracking-wider font-semibold hover:brightness-110 transition"
          >
            ▶ Play all
          </button>
        </div>
      </div>

      <div className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${size + 60}px, 1fr))` }}>
        {filtered.map((icon) => (
          <div key={icon.name}
            className="edge-card flex flex-col items-center gap-2 py-4 px-2 bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)] transition-colors">
            <InlineIcon
              svg={icon.svg}
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
            <span className="text-[10px] font-mono text-[var(--color-ink-faint)] truncate max-w-full">
              {icon.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: Array<readonly [string, string]>;
}) {
  return (
    <label className="flex items-center gap-2 label-cap">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-2 py-1 text-xs font-mono">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function ColorPicker({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <label className="flex items-center gap-2 label-cap">
      {label}
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 cursor-pointer bg-transparent border border-[var(--color-line)] rounded" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-20 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-2 py-1 text-xs font-mono outline-none" />
    </label>
  );
}
