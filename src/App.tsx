import { useEffect, useState } from 'react';
import { Scene } from './components/three/Scene';
import { TopBar } from './components/ui/TopBar';
import { Sidebar } from './components/ui/Sidebar';
import { Inspector } from './components/ui/Inspector';
import { DataPanel } from './components/ui/DataPanel';
import { SettingsModal } from './components/ui/SettingsModal';
import { useNookStore } from './store/useNookStore';
import { THEMES } from './data/themes';
import { playTick } from './lib/sound';

/**
 * ─── PHASE 6 (v3): Composition & Keyboard Shortcuts ──────────────────────
 * The layout: a full-screen 3D canvas with HTML floating on top of it.
 * App still knows nothing about Three.js — the boundary between the 2D
 * and 3D worlds is the store, not props. v3 adds the settings modal.
 */

export default function App() {
  const [dataOpen, setDataOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const currentTheme = useNookStore((s) => s.currentTheme);

  // The canvas renders with alpha, so the page background IS the sky.
  // Re-painting <body> completes the theme swap outside WebGL too.
  useEffect(() => {
    const [a, b, c] = THEMES[currentTheme].bg;
    document.body.style.background = `linear-gradient(160deg, ${a} 0%, ${b} 40%, ${c} 100%)`;
  }, [currentTheme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // never steal keys from the room-size inputs
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const { selectedId, placedItems, removeItem, rotateItem, select } =
        useNookStore.getState();

      if (e.key === 'Escape') select(null);

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeItem(selectedId);
        playTick(330, 0.03);
      }

      if (e.key.toLowerCase() === 'r' && selectedId) {
        const item = placedItems.find((p) => p.id === selectedId);
        if (item) {
          rotateItem(selectedId, item.rotation + 45);
          playTick(700, 0.03);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div id="scene">
        <Scene />
      </div>
      <TopBar
        dataOpen={dataOpen}
        onToggleData={() => setDataOpen((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <Sidebar />
      <Inspector />
      <DataPanel open={dataOpen} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}