"use client";

// Thin orchestrator: grid + side panel. Both children are independent
// modules so editing the panel doesn't force a grid recompile (and
// vice versa). Server passes only metadata — `<img src="/svg/…">` in
// the grid + on-click fetch in the panel keep the client payload to
// ~8 KB no matter how big the icon set grows.

import { useState } from "react";
import { IconGrid } from "./IconGrid";
import { IconPanel } from "./IconPanel";
import type { StudioIconMeta } from "./types";

export function IconStudio({ icons }: { icons: StudioIconMeta[] }) {
  const [selected, setSelected] = useState<StudioIconMeta | null>(null);
  return (
    <div className="flex gap-6">
      <div className={selected ? "min-w-0 flex-1" : "w-full"}>
        <IconGrid
          icons={icons}
          selectedName={selected?.name}
          onSelect={setSelected}
        />
      </div>
      {selected && (
        <IconPanel
          icon={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
