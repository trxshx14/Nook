import { useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { CATALOG } from '../../data/catalog';
import { useNookStore } from '../../store/useNookStore';
import { dragOffset } from '../../lib/dragState';
import { snap, clampToRoom } from '../../lib/math';
import { playTick } from '../../lib/sound';

/**
 * ─── PHASE 4: The Drag Plane Pattern ─────────────────────────────────────
 * The classic problem: if you listen for pointer moves on the furniture
 * itself, the moment your cursor slips off the mesh (easy while moving
 * fast), the drag dies.
 *
 * The fix: while a drag is active, mount a huge invisible plane at floor
 * level and listen on THAT. The cursor can never escape a 200×200m plane,
 * and `e.point` conveniently gives us the exact floor coordinate under the
 * cursor. When the drag ends, the plane unmounts.
 *
 * This is where the snapping happens — compare the snapped cell to the
 * item's current cell, and only write to the store (and click!) when the
 * item actually enters a NEW cell. That per-cell tick is what makes it feel
 * like LEGO.
 */

export function DragPlane() {
  const draggingId = useNookStore((s) => s.draggingId);
  const setDragging = useNookStore((s) => s.setDragging);

  // Safety net: if the pointer is released outside the canvas, still end the drag.
  useEffect(() => {
    const end = () => {
      if (useNookStore.getState().draggingId) {
        useNookStore.getState().setDragging(null);
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('pointerup', end);
    return () => window.removeEventListener('pointerup', end);
  }, []);

  if (!draggingId) return null;

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const state = useNookStore.getState();
    const item = state.placedItems.find((p) => p.id === state.draggingId);
    if (!item) return;
    const def = CATALOG[item.type];

    // ✨ the whole trick: cursor point + grab offset → snap → clamp ✨
    const x = snap(e.point.x + dragOffset.x);
    const z = snap(e.point.z + dragOffset.z);
    const [cx, cz] = clampToRoom(x, z, def.half, state.room);

    // Only commit when the item enters a new grid cell
    if (cx !== item.position[0] || cz !== item.position[2]) {
      state.moveItem(item.id, cx, cz);
      playTick(880, 0.02);
    }
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(null)}
    >
      <planeGeometry args={[200, 200]} />
      {/* invisible but still raycastable */}
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
