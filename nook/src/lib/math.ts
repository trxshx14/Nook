import type { RoomSize } from '../types';

/**
 * ─── PHASE 4: The Grid Snapping Math ─────────────────────────────────────
 * Free-floating 3D movement with a mouse feels wildly imprecise. Rounding
 * every coordinate to the nearest SNAP interval makes items "click" into
 * place like LEGO bricks — the single biggest UX win in the app.
 */

export const SNAP = 0.5; // meters between grid cells

/** snapped = round(value / SNAP) * SNAP */
export const snap = (v: number) => Math.round(v / SNAP) * SNAP;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Keeps an item's center inside the room, accounting for the item's own
 * half-extents (its footprint) so a sofa can't hang through a wall.
 * Returns the corrected [x, z].
 */
export function clampToRoom(
  x: number,
  z: number,
  half: [number, number],
  room: RoomSize,
): [number, number] {
  const hx = Math.min(half[0], room.width / 2);
  const hz = Math.min(half[1], room.depth / 2);
  return [
    clamp(x, -room.width / 2 + hx, room.width / 2 - hx),
    clamp(z, -room.depth / 2 + hz, room.depth / 2 - hz),
  ];
}

/** Ease-out-back: overshoots slightly then settles. Used for the spawn "pop". */
export function easeOutBack(t: number): number {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
