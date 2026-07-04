import { CATALOG_LIST } from '../../data/catalog';
import { useNookStore } from '../../store/useNookStore';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 3: Click-to-Spawn ─────────────────────────────────────────────
 * The UX flow from the blueprint: click a cute card → addItem() appends a
 * PlacedItem to the store → the Scene's .map() renders it. The sidebar
 * never touches Three.js at all.
 */

export function Sidebar() {
  const addItem = useNookStore((s) => s.addItem);

  return (
    <aside aria-label="Furniture catalog">
      <h2>FURNITURE</h2>
      <div className="catalog">
        {CATALOG_LIST.map((def) => (
          <button
            key={def.type}
            className="card"
            onClick={() => {
              addItem(def.type);
              playTick(660, 0.03);
            }}
          >
            <span className="thumb">{def.emoji}</span>
            <span className="name">{def.name}</span>
          </button>
        ))}
      </div>

      <div className="hint">
        <b>Drag</b> furniture to move it — it snaps to the grid.
        <br />
        <b>Drag the floor</b> to orbit · <b>scroll</b> to zoom · <b>right-drag</b> to pan.
        <br />
        <kbd>R</kbd> rotate 45° · <kbd>Del</kbd> remove · <kbd>Esc</kbd> deselect
      </div>
    </aside>
  );
}
