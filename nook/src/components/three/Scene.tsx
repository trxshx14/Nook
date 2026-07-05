import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNookStore } from '../../store/useNookStore';
import { Room } from './Room';
import { Furniture } from './Furniture';
import { DragPlane } from './DragPlane';
import { SelectionRing } from './SelectionRing';
import { CatTracker } from './CatTracker';

/**
 * ─── PHASE 2: The Scene ──────────────────────────────────────────────────
 * This is the "React Three Fiber renders your state" moment from the
 * blueprint, live:
 *
 *     {placedItems.map((item) => <Furniture key={item.id} item={item} />)}
 *
 * Add an object to the array → a mesh appears. Remove one → it disappears.
 * No imperative scene management, ever.
 *
 * Camera UX decisions (the part a UX manager will ask about):
 *  - OrbitControls is DISABLED while an item is being dragged, so moving a
 *    sofa never accidentally spins the camera. One boolean, huge win.
 *  - Polar angle is clamped so users can never flip underneath the floor.
 *  - Distance is clamped so they can't zoom inside a sofa or out to space.
 */

export function Scene() {
  const placedItems = useNookStore((s) => s.placedItems);
  const draggingId = useNookStore((s) => s.draggingId);
  const catEnabled = useNookStore((s) => s.catEnabled);

  return (
    <Canvas
      shadows
      camera={{ position: [7, 7.5, 9], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {/* soft, warm, toy-like lighting */}
      <ambientLight color="#fff4e8" intensity={0.65} />
      <hemisphereLight color="#dfefff" groundColor="#f6e3d3" intensity={0.5} />
      <directionalLight
        color="#fff1de"
        intensity={0.9}
        position={[6, 12, 5]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />

      <Room />

      {placedItems.map((item) => (
        <Furniture key={item.id} item={item} />
      ))}

      <SelectionRing />
      <DragPlane />
      {catEnabled && <CatTracker />}

      <OrbitControls
        makeDefault
        enabled={!draggingId}
        target={[0, 0.4, 0]}
        minDistance={5}
        maxDistance={26}
        minPolarAngle={0.28}
        maxPolarAngle={1.42}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
