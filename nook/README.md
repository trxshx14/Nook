# 🛋️ Nook — a cozy 3D room arranger

A lightweight, beginner-friendly interior design app. Pick from **21 pastel furniture items across 6 categories**, drop them into a 3D room, drag them around (they snap to the grid like LEGO), rotate with a slider, recolor with swatches — then re-skin the entire room with one-click **aesthetic themes** (Cozy Cottage / Retro 70s / Space Minimalist) while a resident **pathfinding cat** wanders the floor and complains when your furniture blocks its way. Think *Animal Crossing meets a premium minimalist design tool*.

**Stack:** Vite · React 18 · TypeScript · React Three Fiber · drei · Zustand

**Why this project matters for a Frontend + UX/UI portfolio:** it proves you can connect a 3D scene to real application data (a coordinate array, not a canned animation), and that you can take a naturally clunky engineering problem — 3D spatial manipulation with a mouse — and make it feel effortless for a casual user.

---

## Quick start

Requires Node 18+.

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # type-checks and bundles for production
```

Controls: click a card to spawn furniture · drag furniture to move it · drag the floor to orbit · scroll to zoom · right-drag to pan · `R` rotates 45° · `Delete` removes · `Esc` deselects. The **{ } Live data** button shows the `placedItems` array updating in real time.

---

## The core idea (read this before anything else)

There is exactly **one** piece of truth in this app: an array called `placedItems` living in a Zustand store.

```
        writes                       reads
Sidebar ───────►┌──────────────────┐◄─────── Inspector
                │   Zustand store   │
Keyboard ──────►│   placedItems[]   │◄─────── DataPanel
                │   selectedId      │
DragPlane ─────►│   room, ...       │◄─────── Scene (.map → <Furniture/>)
                └──────────────────┘
```

The 3D scene never owns data. It renders whatever is in the array:

```tsx
{placedItems.map((item) => <Furniture key={item.id} item={item} />)}
```

Add an object to the array → a sofa appears. Change `position` → the sofa moves. This is the same mental model as rendering a `<li>` list, just with meshes — and it's the single most important thing to be able to explain in an interview.

## File map

```
src/
├── types.ts                      # PlacedItem schema + the 21-type union — start here
├── store/useNookStore.ts         # Zustand store: all state + actions, persist v2 migration
├── data/
│   ├── catalog.tsx               # 21 primitive-built models across 6 categories
│   └── themes.ts                 # the "Style Sheet" system: 3 themes × color slots
├── lib/
│   ├── math.ts                   # snap(), clampToRoom(), easeOutBack()
│   ├── dragState.ts              # the grab-offset vector (mutable, non-React)
│   ├── sound.ts                  # Web Audio "tick" synth
│   └── textures.ts               # procedural CanvasTextures (TV screens, rug, weave)
├── components/
│   ├── three/                    # everything inside the <Canvas>
│   │   ├── Scene.tsx             # Canvas, lights, OrbitControls, the .map()
│   │   ├── Room.tsx              # theme-colored floor, grid, auto-fading walls
│   │   ├── Furniture.tsx         # renders one item, starts drags, pop/pulse anims
│   │   ├── DragPlane.tsx         # invisible plane that powers dragging + snapping
│   │   ├── SelectionRing.tsx     # pulsing ring under the selected item
│   │   └── CatTracker.tsx        # the wandering pathfinding cat + blocked bubble
│   └── ui/                       # plain HTML floating over the canvas
│       ├── TopBar.tsx            # room size, theme picker, cat/sound/data toggles
│       ├── Sidebar.tsx           # click-to-spawn catalog, grouped by category
│       ├── Inspector.tsx         # rotate slider, theme swatches, dup/remove
│       └── DataPanel.tsx         # live JSON view of placedItems
├── App.tsx                       # composition, keyboard shortcuts, theme background
└── index.css                     # the pastel design system
```

---

# 🎓 Build-it-yourself guide

The finished code is here so you're never stuck, but you'll learn 10× more by rebuilding it. Recommended approach: create a fresh branch, delete `src/`, and reconstruct it phase by phase — peeking at the finished files only when you're stuck for more than ~20 minutes. Each phase ends with a **checkpoint** so you always have something working.

## Phase 0 — Scaffold (30 min)

Create the project and install the stack:

```bash
npm create vite@latest nook -- --template react-ts
cd nook
npm install three @react-three/fiber @react-three/drei zustand
npm install -D @types/three
```

Render a `<Canvas>` from `@react-three/fiber` with a single `<mesh>` box inside. Make it full-screen with `position: fixed; inset: 0`.

**Checkpoint:** an orange-ish cube on screen. If you see it, R3F is wired up.

**Concept to internalize:** in R3F, `<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>` aren't imported components — they're lowercase JSX elements that map 1:1 to Three.js classes. `<boxGeometry args={[2, 1, 1]} />` is `new THREE.BoxGeometry(2, 1, 1)`.

## Phase 1 — The schema and the store (1–2 hrs)

Write `types.ts` first (copy the `PlacedItem` interface — it IS the project blueprint), then build the Zustand store with just three things: `placedItems`, `addItem`, and `removeItem`.

```ts
export const useNookStore = create<NookState>((set) => ({
  placedItems: [],
  addItem: (type) => set((s) => ({
    placedItems: [...s.placedItems, makeItem(type)],
  })),
  ...
}));
```

Test it without any 3D at all: a button that calls `addItem('sofa')` and a `<pre>{JSON.stringify(placedItems)}</pre>`. This is exactly what `DataPanel.tsx` grew up to be.

**Checkpoint:** clicking a button appends objects to a visible JSON array.

**Concepts:** why Zustand over `useState` — the store is accessible from *any* component (2D or 3D) without prop drilling, and from outside React entirely via `useNookStore.getState()` (which the keyboard shortcuts and drag handlers rely on). Also note every action creates *new* arrays/objects — immutability is what lets React know something changed.

## Phase 2 — The room (2–3 hrs)

Build `Room.tsx`: a flat box for the floor, a `<gridHelper>` showing the snap cells, two walls. Add lights in `Scene.tsx` (ambient + hemisphere + one shadow-casting directional) and drei's `<OrbitControls>`.

Files to study: `Room.tsx`, `Scene.tsx`.

**Checkpoint:** an empty pastel room you can orbit around and zoom.

**Concepts:**
1. **Clamp the camera.** `minPolarAngle`/`maxPolarAngle` stop users flipping under the floor; `minDistance`/`maxDistance` stop them zooming into a wall or out to space. Constraining freedom is a UX decision — casual users should never be able to get "lost".
2. **The wall fade.** In `Room.tsx`, a `useFrame` hook checks the camera position every frame and drops a wall's opacity to 12% when the camera is behind it. Small trick, huge perceived polish.

## Phase 3 — Click-to-spawn (2–3 hrs)

Build one furniture model out of primitives (start with the chair — it's a box, a box, and four cylinders), register it in `catalog.tsx`, and render the store in `Scene.tsx`:

```tsx
{placedItems.map((item) => <Furniture key={item.id} item={item} />)}
```

Wire the sidebar cards to `addItem`.

**Checkpoint:** clicking "Chair" makes a chair appear in the room. Click it five times, five chairs. Delete one from the array via React DevTools → it vanishes. *That* is state-driven rendering.

**Concepts:** the catalog pattern — each entry carries its `name`, `defaultColor`, footprint `half`-extents, and a `Model` component. Adding furniture type #7 means touching exactly one file. Recruiters notice extensible design.

## Phase 4 — Drag + grid snapping (3–5 hrs, the boss fight)

This is the heart of the project. The flow:

1. **Pointer down on furniture** (`Furniture.tsx`): R3F's built-in raycasting means a plain `onPointerDown` on the `<group>` works. Call `e.stopPropagation()` (so the floor/controls don't also react), select the item, set `draggingId` in the store, and record the **grab offset** — the difference between the item's center and where on the floor the ray actually hit. Without it, items "jump" so their center lands under your cursor.
2. **OrbitControls surrender** (`Scene.tsx`): `enabled={!draggingId}`. One boolean prevents the #1 frustration in every amateur 3D editor — dragging an object while the camera also spins.
3. **The DragPlane** (`DragPlane.tsx`): while dragging, mount a huge invisible plane at floor level and listen for `onPointerMove` on *it*, not on the furniture. If you listen on the furniture, the drag dies the instant your cursor outruns the mesh. `e.point` gives the floor coordinate under the cursor for free.
4. **The snap:**

```ts
const x = snap(e.point.x + dragOffset.x);   // Math.round(v / 0.5) * 0.5
const z = snap(e.point.z + dragOffset.z);
const [cx, cz] = clampToRoom(x, z, def.half, room);  // can't leave the room
if (cx !== item.position[0] || cz !== item.position[2]) {
  moveItem(item.id, cx, cz);   // only write on a NEW cell
  playTick(880);                // ...which is also when it "clicks"
}
```

**Checkpoint:** furniture drags smoothly, clicks into 0.5m cells, refuses to leave the room, and the camera stays put the whole time.

**Concepts:** raycasting (a ray from the camera through the cursor — R3F does the math, you handle the event) · ray↔plane intersection · why the "new cell" check matters (it turns 60 writes/second into ~2 writes per drag, and gives you the perfect moment to fire feedback).

## Phase 5 — Selection & the inspector (2–3 hrs)

Build `SelectionRing.tsx` (a `ringGeometry` at the selected item's position, opacity pulsing via `useFrame`) and `Inspector.tsx` (slides up when something is selected).

The rotation slider is a **controlled input**: `value={item.rotation}` and `onChange` → `rotateItem`. Because the store is the only truth, pressing `R` on the keyboard moves the slider too, and the slider can never disagree with the mesh.

**Checkpoint:** select a sofa → ring appears + panel slides up → slider spins the sofa → swatches recolor it → `Esc` or clicking empty floor deselects. (Deselect detail: `Room.tsx` checks `e.delta <= 3` so an orbit-drag that happens to end on the floor doesn't count as a click.)

## Phase 6 — Juice (2–3 hrs)

The features that separate "works" from "feels amazing":

- **Spawn pop** — scale animates 0 → 1 with `easeOutBack` overshoot (`Furniture.tsx`).
- **Snap pulse** — a 5% swell for 130ms whenever an item enters a new cell.
- **Sound** — a 90ms Web Audio sine blip; different pitches for spawn/snap/remove (`lib/sound.ts`). No audio files needed.
- **Persistence** — Zustand's `persist` middleware makes the room survive refresh. It's ~5 lines (`useNookStore.ts`) and demos beautifully: arrange a room, hit F5, everything's still there.
- **Keyboard shortcuts** — `App.tsx`; note the guard so typing in the room-size inputs doesn't trigger them.

**Important pattern:** the pop/pulse animations mutate `group.scale` inside `useFrame` instead of using React state. Animating via `setState` at 60fps would re-render 60×/sec; mutating a ref costs nothing. Knowing *what belongs in state vs. a ref* is the difference between a junior and a mid-level React 3D dev — expect interview questions here.

## Phase 7 — Ship it

```bash
npm run build
```

Deploy `dist/` to Netlify, Vercel, or GitHub Pages. Then record a 30-second screen capture for your README/LinkedIn: spawn → drag (with the data panel open!) → rotate → recolor → switch themes → refresh to show persistence.

---

# 🚀 The v2 systems (Phases 8–10)

Version 2 is where the project stops being a demo and starts being a product. Each system below is also a self-contained lesson.

## Phase 8 — A catalog at scale (21 items, 6 categories)

The interesting problem isn't modeling 21 pieces of furniture — it's doing that *without the code becoming 21 copies of the same boilerplate*. Study `catalog.tsx`:

- **Part helpers** (`Bx`, `Cy`, `Sp`, `Tr`) wrap a mesh + `meshPhysicalMaterial` pair so each model reads like a parts list instead of 40 lines of JSX per primitive. When you find yourself typing the same 6-line block for the third time, that's the signal to extract a helper.
- **The registry does the wiring.** Each entry declares its `category`, footprint, obstacle flag and default swatch; `CATALOG_BY_CATEGORY` derives the grouped sidebar from it. Adding item #22 = write one model function, add one registry line. The sidebar, spawn logic, clamping, cat avoidance, and inspector all pick it up automatically. *Extensible by construction* is a phrase worth using in interviews.
- **Persistence must survive schema changes.** The v1 catalog had types like `'sofa'` that no longer exist, and old saves live in visitors' localStorage. The store's `persist` config now carries `version: 2` and a `migrate` function that filters unknown types instead of crashing. Every real SaaS app does exactly this dance.
- **Procedural textures** (`lib/textures.ts`): the rug's checkerboard, the sideboard's rattan weave, and the pegboard's dot grid are drawn on tiny offscreen `<canvas>` elements and wrapped in `THREE.CanvasTexture` — zero image downloads.

**Exercise:** add a `'toy_chest'` item. You should only need to touch `types.ts` (one union member) and `catalog.tsx` (one model + one registry line).

## Phase 9 — The "Style Sheet" theme system

Open the theme picker and flip between Cozy Cottage 🏡, Retro 70s 🕺, and Space Minimalist 🌙. Floors, walls, wood grains, lamp glows, the page background — and the TV broadcast — all change from a single store write. The design that makes this possible:

- **Themes define slots, not item colors** (`data/themes.ts`). A `Theme` is `{ wood, woodDark, secondary, leaf, emissive, floor, wall, swatches, screen … }`. Every mesh part in the catalog is *tagged* by which slot it reads: `color={theme.wood}` for legs, `e={theme.emissive}` for glows, `color={color}` for primary fabric. Swapping the theme re-resolves every tag. This is the 3D equivalent of CSS custom properties — hence the feature's name.
- **User intent is preserved.** Primary parts keep the per-item `color` the user chose; only the theme supplies the swatch *palette* and spawn defaults. Re-painting a user's deliberate choices on theme-switch would be a UX betrayal — the distinction between "system-owned" and "user-owned" color is a design decision, not a technical one.
- **The TV is the showpiece** (`RetroTelevision` in `catalog.tsx` + `makeScreenTexture` in `textures.ts`). Each theme describes a screen pattern — amber fireplace, groovy waves, neon perspective grid — drawn procedurally and applied as both `map` and `emissiveMap`, so the screen genuinely *glows* with its broadcast. `useMemo(..., [theme])` regenerates it only on theme change.
- Note the plumbing detail in `Room.tsx`: `<gridHelper args={[..., theme.grid[0], theme.grid[1]]}>` — changing `args` makes R3F rebuild the helper, which is how the grid re-colors without manual disposal.

**Exercise:** add a fourth theme ("Strawberry Milk"? "Forest Cabin"?). It's one object in `themes.ts` — everything else, including the picker button, derives from `THEME_LIST`.

## Phase 10 — The Cat Tracker (a pathfinding agent)

`CatTracker.tsx` is a tiny autonomous agent living in your room, and it's the loudest proof that `placedItems` is *real, queryable application data*: an AI is literally navigating your interior-design decisions.

The loop, running in `useFrame`:

1. **Idle** → pick a random snapped cell as a destination.
2. **Validate against the store**: build inflated AABBs from every `obstacle: true` item's position + footprint (inflated by the cat's radius so she doesn't clip corners), then check (a) is the destination inside any box, and (b) **line of sight** — sample points every 20cm along the straight path and test each. Fail either → discard the path.
3. After 14 failed candidates → **sit**, flip `isBlocked` to true, and a floating drei `<Html>` bubble ("🐈? Blocked!") fades in with a plain CSS transition. HTML in 3D space is a superpower: real DOM, real CSS, positioned by the scene graph.
4. **Walk** → step toward the target with a trot-bob, smoothly turning toward the heading (note the `atan2` wrap-around when lerping angles). If you *drop furniture onto her path mid-walk*, the per-step check catches it and she sits down in protest. Try it — it's the best demo moment in the app.

Architecture notes worth internalizing: continuous motion (position, target, mode, timers) lives in a **ref**, mutated at 60fps with zero re-renders; React state is used for exactly one thing — `isBlocked` — because it's the only fact the DOM needs. And the cat reads the store via `useNookStore.getState()` inside the frame loop rather than subscribing, so store churn never re-renders the cat.

**Exercises, easy → hard:** make rugs attract the cat (cats sit on soft things — search `obstacle: false` rug items and bias target picks toward them) · give her a "zoomies" mode with 3× speed every few minutes · replace the straight-line check with real **A\*** over the 0.5m grid so she routes *around* furniture instead of refusing — the honest next step, and a fantastic algorithms exercise.

---

## Stretch goals (roughly in order of impact-per-effort)

1. **Undo/redo** — keep a `past[]`/`future[]` of `placedItems` snapshots in the store; `Ctrl+Z` pops one. Centralized state makes this almost trivial, and it's a massive flex.
2. **A\* pathfinding for the cat** — upgrade her from "refuse blocked paths" to "route around furniture" over the 0.5m grid. The obstacle AABBs are already built; this is a pure algorithms exercise with an adorable payoff.
3. **Collision highlighting** — two items' footprints overlap → tint them red. Pure 2D AABB math on `position` + `half` (the cat's `obstacleBoxes()` already shows the pattern).
4. **Rotation-aware clamping** — a rotated loveseat's footprint isn't recalculated when clamping to walls. Swap `half` for a footprint rotated by `item.rotation` (or simply use the bounding circle).
5. **Real GLTF models** — make chunky models in Blockbench, or grab CC0 packs (Kenney, Poly Pizza), load with drei's `useGLTF`. Only `catalog.tsx` changes.
6. **Top-down 2D mode** — animate the camera to directly overhead and switch to an orthographic view: instant "floor plan" mode that justifies the app's name.
7. **Share via URL** — serialize `placedItems` + `currentTheme` into the query string so a styled room becomes a shareable link.
8. **Touch support pass** — pinch-zoom, larger hit targets, a mobile inspector layout.

## Interview talking points

When you demo this, be ready to answer (all answered in the code comments):

- *"Walk me through what happens when I drag the sofa."* → pointer down → raycast hit → grab offset → controls disabled → drag plane mounts → ray∩plane point → snap → clamp → store write on new cell → React re-renders one `Furniture`.
- *"Why Zustand instead of useState/Context?"* → shared between the DOM tree and the Canvas tree without prop drilling; readable outside React (`getState()`) for event handlers; `persist` for free; no provider re-render cascades.
- *"How do you keep 60fps?"* → animations mutate refs in `useFrame` instead of setState; store writes are throttled to cell changes; scratch `Vector3`s are reused instead of allocated per event.
- *"What was the hardest UX problem?"* → making drag feel trustworthy: the grab offset (no jumping), the drag plane (no dead drags), disabling orbit (no camera fights), and snapping (no pixel-perfect fiddling).
- *"How do themes work?"* → themes define color **slots**, mesh parts are tagged by slot, switching themes re-resolves every tag — CSS custom properties, but for 3D materials. User-chosen primary colors are deliberately preserved.
- *"How does the cat 'see' furniture?"* → it doesn't raycast; it reads the same `placedItems` array the renderer uses, builds inflated AABBs from each obstacle's footprint, and validates destination + sampled line-of-sight before walking. One source of truth serves rendering, UI, persistence, *and* AI.
- *"How would you evolve the data schema without breaking users?"* → exactly like v1→v2 did: `persist` versioning with a `migrate` function that filters or transforms stale records.

Have fun — and make the room yours. 🌸
