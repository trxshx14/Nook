import { useEffect } from 'react';
import { useNookStore } from '../../store/useNookStore';
import { playTick } from '../../lib/sound';

/**
 * ─── v3: Cozy Settings Modal ─────────────────────────────────────────────
 * A floating overlay triggered by the gear icon in the navbar. Layout
 * language: rounded-3xl cards, generous whitespace, a quiet editorial
 * serif for the About block. It's plain HTML floating above the canvas —
 * yet its toggles drive the 3D scene, because everything meets in the
 * store.
 *
 * A11y notes: role="dialog" + aria-modal, Escape closes, clicking the
 * backdrop closes, clicks inside the panel don't propagate out.
 */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const soundOn = useNookStore((s) => s.soundOn);
  const toggleSound = useNookStore((s) => s.toggleSound);
  const catEnabled = useNookStore((s) => s.catEnabled);
  const toggleCat = useNookStore((s) => s.toggleCat);
  const clearRoom = useNookStore((s) => s.clearRoom);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>cozy settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="modal-card">
          <div className="setting-row">
            <div>
              <div className="setting-name">Sound</div>
              <div className="setting-desc">little clicks when things snap into place</div>
            </div>
            <button
              className={'switch' + (soundOn ? ' on' : '')}
              role="switch"
              aria-checked={soundOn}
              aria-label="Toggle sound"
              onClick={() => {
                toggleSound();
                playTick(740, 0.03);
              }}
            >
              <span className="knob" />
            </button>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-name">Resident cat</div>
              <div className="setting-desc">she wanders on her own — and judges your layout</div>
            </div>
            <button
              className={'switch' + (catEnabled ? ' on' : '')}
              role="switch"
              aria-checked={catEnabled}
              aria-label="Toggle the cat"
              onClick={() => {
                toggleCat();
                playTick(660, 0.03);
              }}
            >
              <span className="knob" />
            </button>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-name">Start over</div>
              <div className="setting-desc">remove every item from the room</div>
            </div>
            <button
              className="icon-btn danger"
              onClick={() => {
                clearRoom();
                playTick(330, 0.03);
              }}
            >
              🧹 Clear room
            </button>
          </div>
        </div>

        <div className="modal-card about">
          <p>dear diary,</p>
          <p>
            nook was made for anyone who needs a little softness in their study sessions — a cat
            who keeps you company, a window that knows what time it is, and a room that changes as
            you focus.
          </p>
          <p>v1 was a simple room. v3 has a full catalog.</p>
          <p>made with 🌸 and too many late nights.</p>
          <p className="signature">
            designed &amp; built by
            <br />
            trisha raye cararag.
          </p>
        </div>
      </div>
    </div>
  );
}