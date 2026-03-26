const PALETTE_SETS = [
  ['#0f172a', '#1d4ed8', '#38bdf8', '#f8fafc'],
  ['#1f2937', '#0f766e', '#2dd4bf', '#f0fdfa'],
  ['#3f1d38', '#9333ea', '#f472b6', '#fdf2f8'],
  ['#292524', '#b45309', '#f59e0b', '#fffbeb'],
  ['#1f2937', '#dc2626', '#fb7185', '#fff1f2'],
  ['#312e81', '#7c3aed', '#22d3ee', '#ecfeff']
] as const;

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getSeededValue(seed: number, shift: number, max: number, min = 0) {
  const range = Math.max(max - min, 1);
  const shifted = (seed >>> shift) ^ (seed << ((shift % 13) + 1));
  return min + (Math.abs(shifted) % range);
}

function generatePatternSvg(name: string) {
  const seed = hashString(name.trim().toLowerCase() || 'fallback');
  const width = 1600;
  const height = 720;
  const palette = PALETTE_SETS[seed % PALETTE_SETS.length];
  const [bgStart, bgEnd, accentA, accentB] = palette;

  const recursiveLayers = Array.from({ length: 7 }, (_, layer) => {
    const size = 420 - layer * 52;
    const opacity = (0.34 - layer * 0.04).toFixed(2);
    const rotate = (getSeededValue(seed, layer + 2, 55) - 27) + layer * 4;
    const x = width / 2 - size / 2 + getSeededValue(seed, layer + 5, 120, -60);
    const y = height / 2 - size / 2 + getSeededValue(seed, layer + 8, 90, -45);

    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${24 - Math.min(layer, 5) * 3}" fill="${layer % 2 === 0 ? accentA : accentB}" opacity="${opacity}" transform="rotate(${rotate} ${width / 2} ${height / 2})" />`;
  }).join('');

  const orbitDots = Array.from({ length: 18 }, (_, dot) => {
    const radius = 8 + (dot % 4) * 4;
    const orbit = 120 + dot * 16;
    const angle = (dot / 18) * Math.PI * 2 + (seed % 360) * (Math.PI / 180);
    const cx = width / 2 + Math.cos(angle) * orbit;
    const cy = height / 2 + Math.sin(angle) * orbit * 0.62;
    const fill = dot % 2 === 0 ? accentB : accentA;

    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius}" fill="${fill}" opacity="0.55" />`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Generated hero pattern for ${name}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="${accentA}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${accentA}" stop-opacity="0" />
    </radialGradient>
    <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#glow)" />
  <g filter="url(#soften)">
    ${recursiveLayers}
  </g>
  <g>
    ${orbitDots}
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getFallbackPhoto(venueName: string) {
  return generatePatternSvg(venueName);
}

export const FALLBACK_PHOTOS: string[] = [];
