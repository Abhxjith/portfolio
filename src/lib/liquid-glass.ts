import type { CSSProperties } from "react";

export const LIGHT_SOURCE = { x: 0.5, y: 0.0 };
const BINS = 24;

export type DisplacementMap = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  url: string;
};

export function generateSmoothConvexMap(
  width: number,
  height: number
): DisplacementMap | null {
  const w = Math.max(1, Math.round(width) || 0);
  const h = Math.max(1, Math.round(height) || 0);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const power = 3.5;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x / w) * 2 - 1;
      const ny = (y / h) * 2 - 1;
      const d = Math.pow(Math.abs(nx), power) + Math.pow(Math.abs(ny), power);

      let r = 128;
      let g = 128;

      if (d <= 1) {
        const curveMagnitude = Math.sin(Math.pow(d, 0.8) * Math.PI);
        const dx = -nx * curveMagnitude;
        const dy = -ny * curveMagnitude;

        r = Math.round(128 + dx * 127);
        g = Math.round(128 + dy * 127);
      }

      const index = (y * w + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = 128;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { width: w, height: h, data, url: canvas.toDataURL("image/png") };
}

export function analyzeRefraction(map: DisplacementMap, lightAz: number) {
  const { width, height, data } = map;
  const profile = new Array(BINS).fill(0);
  const counts = new Array(BINS).fill(0);
  let sumX = 0;
  let sumY = 0;
  let sumMag = 0;

  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const bx = (data[i] - 128) / 127;
      const by = (data[i + 1] - 128) / 127;
      const mag = Math.hypot(bx, by);
      if (mag < 0.02) continue;

      const ang = Math.atan2(by, bx);
      const facing = Math.max(0, Math.cos(ang - lightAz));
      const bright = mag * (0.35 + 0.65 * facing);

      sumX += Math.cos(ang) * bright;
      sumY += Math.sin(ang) * bright;
      sumMag += bright;

      let bin = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BINS) % BINS;
      if (bin < 0) bin += BINS;
      profile[bin] += bright;
      counts[bin]++;
    }
  }

  let maxP = 0;
  for (let b = 0; b < BINS; b++) {
    if (counts[b]) profile[b] /= counts[b];
    if (profile[b] > maxP) maxP = profile[b];
  }
  if (maxP > 0) {
    for (let b = 0; b < BINS; b++) profile[b] /= maxP;
  }

  const domAngle = Math.atan2(sumY, sumX);
  const samples = Math.max(1, (width * height) / (step * step));
  const magnitude = Math.min(1, (sumMag / samples) * 6);

  return { profile, domAngle, magnitude };
}

export function buildConicGradient(profile: number[], fromDeg: number) {
  const stops: string[] = [];
  for (let b = 0; b <= BINS; b++) {
    const idx = b % BINS;
    const t = profile[idx];
    const deg = (b / BINS) * 360;
    const op = (0.07 + t * 0.63).toFixed(3);
    stops.push(`rgba(255,255,255,${op}) ${deg.toFixed(1)}deg`);
  }
  return `conic-gradient(from ${fromDeg.toFixed(1)}deg at 50% 50%, ${stops.join(", ")})`;
}

export const defaultGlassStyle = {
  "--cos": "0",
  "--sin": "-0.85",
  "--light-angle": "0deg",
  "--rim-intensity": "0.65",
  "--rim-gradient": "none",
} as CSSProperties;
