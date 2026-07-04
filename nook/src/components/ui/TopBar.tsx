import { useNookStore } from '../../store/useNookStore';

/**
 * ─── PHASE 5: 2D UI ↔ 3D scene ───────────────────────────────────────────
 * These are plain HTML inputs, yet typing a number instantly rebuilds the
 * 3D room and pulls stranded furniture back inside — because both worlds
 * read the same store. This file is the "HTML talks to WebGL" proof.
 */

interface Props {
  dataOpen: boolean;
  onToggleData: () => void;
}

export function TopBar({ dataOpen, onToggleData }: Props) {
  const room = useNookStore((s) => s.room);
  const setRoom = useNookStore((s) => s.setRoom);
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

      <div className="spacer" />

      <button className="chip-btn" onClick={clearRoom}>
        🧹 Clear room
      </button>
      <button className="chip-btn" aria-pressed={soundOn} onClick={toggleSound}>
        {soundOn ? '🔔 Sound on' : '🔕 Sound off'}
      </button>
      <button className="chip-btn" aria-pressed={dataOpen} onClick={onToggleData}>
        {'{ }'} Live data
      </button>
    </header>
  );
}
