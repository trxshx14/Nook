import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Group, Plane, Vector3, MathUtils } from 'three';
import type { PlacedItem } from '../../types';
import { CATALOG } from '../../data/catalog';
import { useNookStore } from '../../store/useNookStore';
import { dragOffset } from '../../lib/dragState';
import { easeOutBack } from '../../lib/math';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 3 + 4: State-driven rendering & starting a drag ──────────────
 * This component is a pure function of one PlacedItem: position, rotation
 * and color all come straight from the store. When the store changes, React
 * re-renders it — the scene can never drift out of sync with the data.
 *
 * Raycasting is free here: R3F runs a raycaster under the hood so a plain
 * `onPointerDown` on a <group> "just works", even against child meshes.
 */

const GROUND = new Plane(new Vector3(0, 1, 0), 0); // the y=0 plane
const hit = new Vector3(); // reused scratch vector — no allocations per event

export function Furniture({ item }: { item: PlacedItem }) {
  const group = useRef<Group>(null);
  const def = CATALOG[item.type];
  const select = useNookStore((s) => s.select);
  const setDragging = useNookStore((s) => s.setDragging);

  /* ── micro-animations, driven imperatively for 60fps smoothness ── */
  const bornAt = useRef(performance.now()); // spawn pop
  const pulseAt = useRef(0); // snap pulse

  // Detect a position change during render (a new snap cell) and arm the pulse.
  const posKey = item.position.join(',');
  const prevPos = useRef(posKey);
  if (prevPos.current !== posKey) {
    prevPos.current = posKey;
    pulseAt.current = performance.now();
  }

  useFrame(() => {
    if (!group.current) return;
    const now = performance.now();

    // spawn: scale 0 → 1 with a playful overshoot
    const born = Math.min((now - bornAt.current) / 340, 1);
    const pop = born < 1 ? Math.max(easeOutBack(born), 0.01) : 1;

    // snap: a quick 5% swell that decays over 130ms
    const q = (now - pulseAt.current) / 130;
    const pulse = q < 1 ? 1 + Math.sin(q * Math.PI) * 0.05 : 1;

    group.current.scale.setScalar(pop * pulse);
  });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // don't let the floor/OrbitControls see this press
    select(item.id);
    setDragging(item.id);
    // Where on the ground is the cursor right now? Remember the offset
    // between that point and the item's center so it doesn't jump.
    e.ray.intersectPlane(GROUND, hit);
    dragOffset.set(item.position[0] - hit.x, 0, item.position[2] - hit.z);
    playTick(660, 0.03);
    document.body.style.cursor = 'grabbing';
  };

  return (
    <group
      ref={group}
      position={item.position}
      rotation={[0, MathUtils.degToRad(item.rotation), 0]}
      onPointerDown={onPointerDown}
      onPointerOver={() => (document.body.style.cursor = 'grab')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <def.Model color={item.color} />
    </group>
  );
}
