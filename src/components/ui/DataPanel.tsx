import { useNookStore } from '../../store/useNookStore';

/**
 * ─── The Demo Weapon ─────────────────────────────────────────────────────
 * A live JSON view of `placedItems`. When you demo this project, open this
 * panel and drag a sofa around — recruiters SEE the coordinates update in
 * real time, proving the 3D scene is driven by application data rather
 * than being a canned animation.
 */

export function DataPanel({ open }: { open: boolean }) {
  const placedItems = useNookStore((s) => s.placedItems);

  if (!open) return null;

  return (
    <div className="data-panel">
      <h2>placedItems — source of truth</h2>
      <pre>
        {JSON.stringify(
          placedItems,
          (_k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v),
          2,
        )}
      </pre>
    </div>
  );
}
