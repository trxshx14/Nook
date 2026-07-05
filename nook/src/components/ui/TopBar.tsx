import { useNookStore } from '../../store/useNookStore';
import { THEME_LIST } from '../../data/themes';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 5 (v2): 2D UI ↔ 3D scene ─────────────────────────────────────
 * The theme picker is the loudest proof of the shared-store architecture:
 * three plain HTML buttons, and clicking one re-skins the entire WebGL
 * scene — floor, walls, wood grains, lamp glows, and the TV broadcast.
 */

interface Props {
  dataOpen: boolean;
  onToggleData: () => void;
}

export function TopBar({ dataOpen, onToggleData }: Props) {
  const room = useNookStore((s) => s.room);
  const setRoom = useNookStore((s) => s.setRoom);
  const currentTheme = useNookStore((s) => s.currentTheme);
  const setTheme = useNookStore((s) => s.setTheme);
  const catEnabled = useNookStore((s) => s.catEnabled);
  const toggleCat = useNookStore((s) => s.toggleCat);
  const soundOn = useNookStore((s) => s.soundOn);
  const toggleSound = useNookStore((s) => s.toggleSound);
  const clearRoom = useNookStore((s) => s.clearRoom);

  return (
    <header>
      <div className="logo">
        <span className="dot" />
        Nook
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

      <div className="spacer" />

      <button className="chip-btn" aria-pressed={catEnabled} onClick={toggleCat}>
        {catEnabled ? '🐈 Cat on' : '🐈‍⬛ Cat off'}
      </button>
      <button className="chip-btn" onClick={clearRoom}>
        🧹 Clear
      </button>
      <button className="chip-btn" aria-pressed={soundOn} onClick={toggleSound}>
        {soundOn ? '🔔' : '🔕'}
      </button>
      <button className="chip-btn" aria-pressed={dataOpen} onClick={onToggleData}>
        {'{ }'} Data
      </button>
    </header>
  );
}
