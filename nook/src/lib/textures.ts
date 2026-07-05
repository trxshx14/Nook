import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import type { ScreenStyle } from '../data/themes';

/**
 * ─── v2: Procedural textures ─────────────────────────────────────────────
 * Zero image files. Every pattern in the app — the TV screen for each
 * theme, the checkered rug, the rattan weave, the pegboard dots — is drawn
 * onto a tiny offscreen <canvas> and wrapped in a THREE.CanvasTexture.
 *
 * This keeps the bundle featherweight and makes themes trivially
 * re-texturable: the texture generators take theme colors as arguments.
 */

function makeCanvas(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement, repeat = 1): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}

/** The retro TV's screen — one procedural pattern per theme. */
export function makeScreenTexture(style: ScreenStyle): CanvasTexture {
  const { canvas, ctx } = makeCanvas(128);
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, 128, 128);

  if (style.pattern === 'fire') {
    // warm amber "fireplace": stacked glowing blobs near the bottom
    const grad = ctx.createRadialGradient(64, 118, 8, 64, 118, 90);
    grad.addColorStop(0, style.colors[2]);
    grad.addColorStop(0.45, style.colors[0]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 7; i++) {
      const x = 30 + Math.random() * 68;
      const r = 6 + Math.random() * 12;
      ctx.fillStyle = style.colors[i % 2];
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.ellipse(x, 112 - Math.random() * 22, r * 0.7, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (style.pattern === 'waves') {
    // groovy horizontal sine bands
    style.colors.forEach((color, band) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 9;
      for (let row = 0; row < 3; row++) {
        ctx.beginPath();
        const baseY = 20 + band * 14 + row * 44;
        for (let x = 0; x <= 128; x += 4) {
          const y = baseY + Math.sin((x / 128) * Math.PI * 2 + band * 1.4) * 7;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
  }

  if (style.pattern === 'grid') {
    // calm neon perspective grid: verticals converge toward a horizon
    const horizon = 44;
    ctx.strokeStyle = style.colors[0];
    ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(64 + i * 6, horizon);
      ctx.lineTo(64 + i * 26, 128);
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const y = horizon + Math.pow(i / 5, 1.7) * (128 - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
    }
    ctx.strokeStyle = style.colors[1];
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(128, horizon);
    ctx.stroke();
  }

  return toTexture(canvas);
}

/** Two-tone checkerboard for the plush rug. */
export function makeCheckerTexture(c1: string, c2: string): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64);
  const cell = 16;
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 ? c1 : c2;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  return toTexture(canvas, 4);
}

/** Woven lattice for the rattan sideboard doors. */
export function makeWeaveTexture(base: string, strand: string): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = strand;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, 0);
    ctx.lineTo(i * 8, 64);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * 8);
    ctx.lineTo(64, i * 8);
    ctx.stroke();
  }
  return toTexture(canvas, 3);
}

/** Dot grid for the pegboard panel. */
export function makeDotsTexture(bg: string, dot: string): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = dot;
  for (let y = 8; y < 64; y += 12)
    for (let x = 8; x < 64; x += 12) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  return toTexture(canvas, 2);
}
