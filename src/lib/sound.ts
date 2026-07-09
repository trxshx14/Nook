import { useNookStore } from '../store/useNookStore';

/**
 * ─── PHASE 6: Sound Design ───────────────────────────────────────────────
 * A ~90ms sine blip synthesized with the Web Audio API — no audio files.
 * Different pitches communicate different actions (spawn = mid, snap = high,
 * remove = low), which is classic game-feel UX.
 *
 * The AudioContext is created lazily inside a user-gesture handler, which is
 * required by browser autoplay policies.
 */

let ctx: AudioContext | null = null;

export function playTick(freq = 880, vol = 0.04) {
  if (!useNookStore.getState().soundOn) return;
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    /* audio is a nice-to-have; never let it crash the app */
  }
}
