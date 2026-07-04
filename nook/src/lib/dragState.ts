import { Vector3 } from 'three';

/**
 * ─── PHASE 4: Drag bookkeeping ───────────────────────────────────────────
 * When you press down on a sofa, you rarely grab its exact center. Without
 * correcting for that, the sofa would "jump" so its center lands under your
 * cursor. We store the offset between the item's center and the grab point
 * here, and add it back on every move.
 *
 * This lives outside React state on purpose: it changes on every mouse
 * event, is only meaningful mid-gesture, and should never cause re-renders.
 * Knowing what belongs in state vs. a mutable ref is a senior-level insight.
 */
export const dragOffset = new Vector3();
