import { CATALOG_BY_CATEGORY } from '../../data/catalog';
import { useNookStore } from '../../store/useNookStore';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 3 (v2): Click-to-Spawn, now with 6 categories ─────────────────
 * The sidebar renders straight from CATALOG_BY_CATEGORY, so adding item #22
 * to the catalog file makes it appear here with zero UI changes. The
 * sidebar still never touches Three.js — it only calls store actions.
 */

export function Sidebar() {
  const addItem = useNookStore((s) => s.addItem);

  return (
    <aside aria-label="Furniture catalog">
      {CATALOG_BY_CATEGORY.map(({ category, items }) => (
        <section key={category} className="cat-section">
          <h2>{category.toUpperCase()}</h2>
          <div className="catalog">
            {items.map((def) => (
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
        </section>
      ))}

      <div className="hint">
        <b>Drag</b> furniture to move it — it snaps to the grid.
        <br />
        <b>Drag the floor</b> to orbit · <b>scroll</b> to zoom · <b>right-drag</b> to pan.
        <br />
        <kbd>R</kbd> rotate 45° · <kbd>Del</kbd> remove · <kbd>Esc</kbd> deselect
        <br />
        <br />
        🐈 The cat wanders on its own — box it in with furniture and it will
        let you know.
      </div>
    </aside>
  );
}
