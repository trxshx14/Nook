#  Nook — Interactive 3D Spatial Room & Furniture Designer

[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2014-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![State Management: Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![3D Graphics: R3F](https://img.shields.io/badge/3D%20Graphics-React%20Three%20Fiber-blue?style=flat-square&logo=three.js)](https://docs.pmnd.rs/react-three-fiber/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**Nook** is a lightweight, interactive spatial design web application that enables casual users to visualize, arrange, and customize interior room layouts inside a 3D environment. Moving completely away from intimidating, industrial CAD software architectures, Nook combines a comforting, cutesy pastel aesthetic with robust frontend state synchronization and mathematical spatial constraint systems.

This project bridges the gap between intricate WebGL canvas data management and meticulous, user-centric micro-interactions.

---

##  Design System & UX Philosophy

Unlike heavy engineering tools, Nook is designed around **cozy, tactile minimalism** to keep non-technical users completely relaxed while designing their spaces:
* **Earthy Pastel Palette:** The interface leverages a signature combination of Creamy Vanilla (`#FBF7F4`), Soft Blush (`#F3E1DC`), and Muted Sage accents (`#D4DDD3`).
* **Tactile Micro-Interactions:** Custom floating HTML detail badges track objects dynamically in 3D screen space, sliding smoothly into focus only when an item is actively selected.
* **Cognitive Load Reduction:** Complex transformations are simplified. Instead of forcing users to navigate full 3D gimbal axes, rotation is handled via a clean 2D slider, and movement snaps seamlessly into a satisfying layout matrix.

---

##  Technical Architecture & Core Logic

### 1. Vector Coordinate State Management
All layout data is driven by a single global matrix array managed via **Zustand**. When an item is added, dragged, colored, or rotated, the state updates instantly, prompting a targeted re-render of the specific React Three Fiber mesh component.

```typescript
interface PlacedItem {
  id: string;
  type: 'sofa' | 'plant' | 'table' | 'chair';
  position: [number, number, number]; // [X, Y, Z] spatial matrix
  rotation: number;                   // Y-axis rotation angle in radians
  color: string;                      // Dynamic hex code mapping
}
