import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FurnitureType, PlacedItem, RoomSize, ThemeName } from '../types';
import { CATALOG } from '../data/catalog';
import { THEMES } from '../data/themes';
import { clampToRoom, snap } from '../lib/math';

/**
 * ─── PHASE 1 (v2): State Management ──────────────────────────────────────
 * One store holds everything. UI components (sidebar, inspector) and 3D
 * components (furniture, the cat) both read from and write to this store.
 *
 * v2 additions:
 *  - `currentTheme` + `setTheme` — the Style Sheet system. Materials across
 *    all 21 models read the active theme's color slots, so this one string
 *    re-skins the whole scene.
 *  - `catEnabled` — toggles the Cat Tracker agent.
 *  - persist `version: 2` + `migrate` — old saves may contain furniture
 *    types that no longer exist; migration filters them out instead of
 *    crashing. Schema versioning is exactly how real SaaS apps evolve
 *    localStorage data.
 */

interface NookState {
  room: RoomSize;
  placedItems: PlacedItem[];
  selectedId: string | null;
  /** While set, OrbitControls are disabled so dragging can't spin the camera */
  draggingId: string | null;
  soundOn: boolean;
  currentTheme: ThemeName;
  catEnabled: boolean;
  /**
   * "Wall Canvas" paint. `null` means "follow the theme's default wall";
   * a hex string is an explicit user choice that survives theme switches.
   */
  wallColor: string | null;

  addItem: (type: FurnitureType) => void;
  moveItem: (id: string, x: number, z: number) => void;
  rotateItem: (id: string, deg: number) => void;
  recolorItem: (id: string, color: string) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  select: (id: string | null) => void;
  setDragging: (id: string | null) => void;
  setRoom: (size: Partial<RoomSize>) => void;
  setTheme: (name: ThemeName) => void;
  setWallColor: (color: string | null) => void;
  toggleCat: () => void;
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
      currentTheme: 'cottage',
      catEnabled: true,
      wallColor: null,

      addItem: (type) => {
        const def = CATALOG[type];
        const { room, currentTheme } = get();
        // New items spawn already on-theme: default color = a theme swatch
        const theme = THEMES[currentTheme];
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
          color: theme.swatches[def.swatch % theme.swatches.length],
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
          placedItems: s.placedItems.map((p) => {
            const def = CATALOG[p.type];
            const [x, z] = clampToRoom(p.position[0], p.position[2], def.half, room);
            return { ...p, position: [x, 0, z] as [number, number, number] };
          }),
        }));
      },

      setTheme: (name) => set({ currentTheme: name }),
      setWallColor: (color) => set({ wallColor: color }),
      toggleCat: () => set((s) => ({ catEnabled: !s.catEnabled })),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      clearRoom: () => set({ placedItems: [], selectedId: null, draggingId: null }),
    }),
    {
      name: 'nook-room',
      version: 3,
      partialize: (s) => ({
        room: s.room,
        placedItems: s.placedItems,
        soundOn: s.soundOn,
        currentTheme: s.currentTheme,
        catEnabled: s.catEnabled,
        wallColor: s.wallColor,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Partial<NookState>;
        if (version < 3) {
          // v1/v2 saves contain retired furniture types (loveseat, desk,
          // retro TV, …). Drop anything the v3 catalog doesn't recognize
          // instead of crashing the renderer.
          state.placedItems = (state.placedItems ?? []).filter(
            (p) => p && p.type in CATALOG,
          );
          if (!state.currentTheme || !(state.currentTheme in THEMES)) {
            state.currentTheme = 'cottage';
          }
          state.wallColor = state.wallColor ?? null;
        }
        return state;
      },
    },
  ),
);