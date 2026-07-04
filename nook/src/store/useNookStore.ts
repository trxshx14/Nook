import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FurnitureType, PlacedItem, RoomSize } from '../types';
import { CATALOG } from '../data/catalog';
import { clampToRoom, snap } from '../lib/math';

/**
 * ─── PHASE 1: State Management (Zustand) ─────────────────────────────────
 * One store holds everything. UI components (sidebar, inspector) and 3D
 * components (furniture meshes) both read from and write to this store,
 * which is how a 2D HTML panel can "talk" to a 3D canvas instantly.
 *
 * The `persist` middleware writes state to localStorage, so the user's room
 * survives a page refresh — a one-line feature that feels like magic.
 */

interface NookState {
  room: RoomSize;
  placedItems: PlacedItem[];
  selectedId: string | null;
  /** While set, OrbitControls are disabled so dragging an item doesn't spin the camera */
  draggingId: string | null;
  soundOn: boolean;

  addItem: (type: FurnitureType) => void;
  moveItem: (id: string, x: number, z: number) => void;
  rotateItem: (id: string, deg: number) => void;
  recolorItem: (id: string, color: string) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  select: (id: string | null) => void;
  setDragging: (id: string | null) => void;
  setRoom: (size: Partial<RoomSize>) => void;
  toggleSound: () => void;
  clearRoom: () => void;
}

const uid = () => 'item_' + Math.random().toString(36).slice(2, 8);

export const useNookStore = create<NookState>()(
  persist(
    (set, get) => ({
      room: { width: 8, depth: 8 },
      placedItems: [],
      selectedId: null,
      draggingId: null,
      soundOn: true,

      addItem: (type) => {
        const def = CATALOG[type];
        const { room } = get();
        // Spawn near the center with a small random snapped offset so
        // repeated spawns don't stack perfectly on top of each other.
        const [x, z] = clampToRoom(
          snap(Math.random() * 2 - 1),
          snap(Math.random() * 2 - 1),
          def.half,
          room,
        );
        const item: PlacedItem = {
          id: uid(),
          type,
          position: [x, 0, z],
          rotation: 0,
          color: def.defaultColor,
        };
        set((s) => ({ placedItems: [...s.placedItems, item], selectedId: item.id }));
      },

      moveItem: (id, x, z) =>
        set((s) => ({
          placedItems: s.placedItems.map((p) =>
            p.id === id ? { ...p, position: [x, 0, z] as [number, number, number] } : p,
          ),
        })),

      rotateItem: (id, deg) =>
        set((s) => ({
          placedItems: s.placedItems.map((p) =>
            p.id === id ? { ...p, rotation: ((deg % 360) + 360) % 360 } : p,
          ),
        })),

      recolorItem: (id, color) =>
        set((s) => ({
          placedItems: s.placedItems.map((p) => (p.id === id ? { ...p, color } : p)),
        })),

      removeItem: (id) =>
        set((s) => ({
          placedItems: s.placedItems.filter((p) => p.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
          draggingId: s.draggingId === id ? null : s.draggingId,
        })),

      duplicateItem: (id) => {
        const { placedItems, room } = get();
        const src = placedItems.find((p) => p.id === id);
        if (!src) return;
        const def = CATALOG[src.type];
        const [x, z] = clampToRoom(
          src.position[0] + snap(0.5),
          src.position[2] + snap(0.5),
          def.half,
          room,
        );
        const copy: PlacedItem = { ...src, id: uid(), position: [x, 0, z] };
        set((s) => ({ placedItems: [...s.placedItems, copy], selectedId: copy.id }));
      },

      select: (id) => set({ selectedId: id }),
      setDragging: (id) => set({ draggingId: id }),

      setRoom: (size) => {
        const room = { ...get().room, ...size };
        room.width = Math.min(Math.max(room.width, 4), 14);
        room.depth = Math.min(Math.max(room.depth, 4), 14);
        set((s) => ({
          room,
          // Pull any furniture that's now outside back into the resized room
          placedItems: s.placedItems.map((p) => {
            const def = CATALOG[p.type];
            const [x, z] = clampToRoom(p.position[0], p.position[2], def.half, room);
            return { ...p, position: [x, 0, z] as [number, number, number] };
          }),
        }));
      },

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      clearRoom: () => set({ placedItems: [], selectedId: null, draggingId: null }),
    }),
    {
      name: 'nook-room',
      // Only persist the data that matters; never persist transient UI state
      partialize: (s) => ({ room: s.room, placedItems: s.placedItems, soundOn: s.soundOn }),
    },
  ),
);
