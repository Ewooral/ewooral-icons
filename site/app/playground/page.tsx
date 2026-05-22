import { loadIcons } from "../../lib/icons";
import { Playground } from "../../components/Playground";

export const metadata = { title: "Playground" };

export default function PlaygroundPage() {
  const icons = loadIcons();
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="label-cap mb-3">Playground</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Twist every knob
        </h1>
        <p className="text-[var(--color-ink-dim)] mt-3 max-w-2xl">
          The same controls the React component exposes — applied to every icon at once. Hover, click,
          scroll, or press <strong className="text-[var(--color-ink)]">Play all</strong> to fire the
          animation depending on your selected trigger.
        </p>
      </div>
      <Playground
        icons={icons.map((i) => ({
          name: i.name,
          displayName: i.displayName,
          pascal: i.pascal,
          motion: i.motion,
          svg: i.svg,
        }))}
      />
    </div>
  );
}
