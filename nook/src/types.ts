/**
 * ─── PHASE 1: The Data Schema ────────────────────────────────────────────
 * This is the "source of truth" for the entire app. The 3D scene never owns
 * data — it is a pure rendering of this state. Understanding this file means
 * understanding the whole architecture.
 */

export type FurnitureType = 'sofa' | 'chair' | 'table' | 'plant' | 'lamp' | 'rug';

export interface PlacedItem {
  /** Unique identifier — used as the React key and for selection/dragging */
  id: string;
  /** Which catalog entry this item was spawned from */
  type: FurnitureType;
  /** [x, y, z] world coordinates. y is always 0 (items sit on the floor) */
  position: [number, number, number];
  /** Rotation around the Y (vertical) axis, in degrees */
  rotation: number;
  /** Pastel hex color chosen by the user */
  color: string;
}

export interface RoomSize {
  width: number; // meters along X
  depth: number; // meters along Z
}
