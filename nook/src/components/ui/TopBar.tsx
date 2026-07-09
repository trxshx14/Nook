import { useNookStore } from '../../store/useNookStore';
import { THEMES, THEME_LIST } from '../../data/themes';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 5 (v3): The navbar ────────────────────────────────────────────
 * v3 additions:
 *  - The NOOK wordmark: a premium serif with wide tracking whose ink color
 *    adapts to the active theme (deep charcoal on warm themes, slate on
 *    the cool one) — editorial branding, not a default sans logo.
 *  - "Wall Canvas": four theme-tuned pastel swatches that write straight
 *    to `wallColor` in the store; the 3D wall materials read it live.
 *    The ↺ chip returns the walls to "follow the theme".
 *  - The gear opens the cozy settings modal (sound/cat/clear moved there
 *    to keep the toolbar calm).
 */

interface Props {
  dataOpen: boolean;
  onToggleData: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ dataOpen, onToggleData, onOpenSettings }: Props) {
  const room = useNookStore((s) => s.room);
  const setRoom = useNookStore((s) => s.setRoom);
  const currentTheme = useNookStore((s) => s.currentTheme);
  const setTheme = useNookStore((s) => s.setTheme);
  const wallColor = useNookStore((s) => s.wallColor);
  const setWallColor = useNookStore((s) => s.setWallColor);

  const theme = THEMES[currentTheme];

  return (
    <header>
      {/* the wordmark — serif, widest tracking, theme-adaptive ink */}
      <div className="logo" style={{ color: theme.ink }}>
        NOOK
      </div>

      <div className="room-dims">
        <span>Room</span>
        <input
          type="number"
          min={4}
          max={14}
          step={1}
          value={room.width}
          aria-label="Room width in meters"
          onChange={(e) => setRoom({ width: +e.target.value })}
        />
        ×
        <input
          type="number"
          min={4}
          max={14}
          step={1}
          value={room.depth}
          aria-label="Room depth in meters"
          onChange={(e) => setRoom({ depth: +e.target.value })}
        />
        <span>m</span>
      </div>

      {/* the Style Sheet picker */}
      <div className="theme-picker" role="group" aria-label="Room theme">
        {THEME_LIST.map((t) => (
          <button
            key={t.name}
            className={'theme-chip' + (currentTheme === t.name ? ' active' : '')}
            aria-pressed={currentTheme === t.name}
            title={t.label}
            onClick={() => {
              setTheme(t.name);
              playTick(740, 0.03);
            }}
          >
            <span
              className="theme-dots"
              style={{
                background: `linear-gradient(90deg, ${t.swatches[0]} 33%, ${t.swatches[1]} 33% 66%, ${t.swatches[2]} 66%)`,
              }}
            />
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Wall Canvas — paint the room's walls */}
      <div className="wall-canvas" role="group" aria-label="Wall Canvas">
        <span className="wall-label">Wall Canvas</span>
        {theme.wallPresets.map((hex) => (
          <button
            key={hex}
            className={'wall-swatch' + (wallColor === hex ? ' active' : '')}
            style={{ background: hex }}
            aria-label={'Paint walls ' + hex}
            aria-pressed={wallColor === hex}
            onClick={() => {
              setWallColor(hex);
              playTick(820, 0.03);
            }}
          />
        ))}
        <button
          className={'wall-swatch auto' + (wallColor === null ? ' active' : '')}
          aria-label="Walls follow the theme"
          aria-pressed={wallColor === null}
          title="Follow theme"
          onClick={() => {
            setWallColor(null);
            playTick(600, 0.03);
          }}
        >
          ↺
        </button>
      </div>

      <div className="spacer" />

      <button className="chip-btn" aria-pressed={dataOpen} onClick={onToggleData}>
        {'{ }'} Data
      </button>
      <button className="chip-btn" onClick={onOpenSettings} aria-label="Open settings" title="Settings">
        ⚙
      </button>
    </header>
  );
}