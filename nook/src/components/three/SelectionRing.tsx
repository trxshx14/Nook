import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshBasicMaterial } from 'three';
import { useNookStore } from '../../store/useNookStore';
import { CATALOG } from '../../data/catalog';

/**
 * ─── PHASE 5: Selection Feedback ─────────────────────────────────────────
 * A soft pink ring sits on the floor under whichever item is selected, and
 * gently "breathes" by animating its opacity. Clear selection feedback is
 * one of the easiest UX wins in a spatial editor: the user should never
 * have to wonder which object the inspector is editing.
 */

export function SelectionRing() {
  const selectedId = useNookStore((s) => s.selectedId);
  const item = useNookStore((s) => s.placedItems.find((p) => p.id === s.selectedId));
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.55 + Math.sin(clock.elapsedTime * 5) * 0.25;
  });

  if (!selectedId || !item) return null;

  const def = CATALOG[item.type];
  const scale = Math.max(def.half[0], def.half[1]) * 1.15;

  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[item.position[0], 0.02, item.position[2]]}
      scale={scale}
    >
      <ringGeometry args={[0.8, 0.95, 48]} />
      <meshBasicMaterial ref={mat} color="#F08CA4" transparent opacity={0.8} />
    </mesh>
  );
}
