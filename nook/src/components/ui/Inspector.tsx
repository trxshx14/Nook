import { CATALOG } from '../../data/catalog';
import { THEMES } from '../../data/themes';
import { useNookStore } from '../../store/useNookStore';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 5: The Inspector ──────────────────────────────────────────────
 * A floating panel that slides up when an item is selected. Note the
 * controlled slider: its value comes FROM the store and writes TO the
 * store, so pressing "R" on the keyboard moves the slider too. One source
 * of truth means the UI can never disagree with the scene.
 */

export function Inspector() {
  const item = useNookStore((s) => s.placedItems.find((p) => p.id === s.selectedId));
  const swatches = useNookStore((s) => THEMES[s.currentTheme].swatches);
  const rotateItem = useNookStore((s) => s.rotateItem);
  const recolorItem = useNookStore((s) => s.recolorItem);
  const removeItem = useNookStore((s) => s.removeItem);
  const duplicateItem = useNookStore((s) => s.duplicateItem);

  const def = item ? CATALOG[item.type] : null;

  return (
    <div className={'inspector' + (item ? ' open' : '')} aria-hidden={!item}>
      {item && def && (
        <>
          <div className="row">
            <span className="item-name">
              {def.emoji} {def.name}
            </span>
            <button
              className="icon-btn"
              onClick={() => {
                duplicateItem(item.id);
                playTick(660, 0.03);
              }}
            >
              ＋ Duplicate
            </button>
            <button
              className="icon-btn danger"
              onClick={() => {
                removeItem(item.id);
                playTick(330, 0.03);
              }}
            >
              ✕ Remove
            </button>
          </div>

          <div className="row">
            <label className="small" htmlFor="rot">
              Rotate
            </label>
            <input
              id="rot"
              type="range"
              min={0}
              max={360}
              step={1}
              value={item.rotation}
              onChange={(e) => rotateItem(item.id, +e.target.value)}
            />
            <span className="deg">{item.rotation}°</span>
          </div>

          <div className="row">
            <span className="small">Color</span>
            <div className="swatches">
              {swatches.map((hex) => (
                <button
                  key={hex}
                  className={'swatch' + (item.color === hex ? ' active' : '')}
                  style={{ background: hex }}
                  aria-label={'Color ' + hex}
                  onClick={() => {
                    recolorItem(item.id, hex);
                    playTick(740, 0.03);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
