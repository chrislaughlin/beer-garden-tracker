function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function seededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createFractalBranch(x: number, y: number, size: number, depth: number, angle: number, hue: number): string {
  if (depth <= 0 || size < 6) {
    return '';
  }

  const opacity = (0.12 + depth * 0.06).toFixed(2);
  const radius = Math.max(size * 0.18, 2);
  const nextSize = size * 0.64;
  const offset = size * 0.38;
  const branchA = createFractalBranch(
    x + Math.cos(angle - 0.52) * offset,
    y + Math.sin(angle - 0.52) * offset,
    nextSize,
    depth - 1,
    angle - 0.56,
    (hue + 22) % 360
  );
  const branchB = createFractalBranch(
    x + Math.cos(angle + 0.52) * offset,
    y + Math.sin(angle + 0.52) * offset,
    nextSize,
    depth - 1,
    angle + 0.56,
    (hue + 34) % 360
  );

  return `<g>
    <rect x="${(x - size / 2).toFixed(2)}" y="${(y - size / 2).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${radius.toFixed(2)}" transform="rotate(${(angle * 57.2958).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="hsla(${hue.toFixed(0)} 76% 62% / ${opacity})"/>
    ${branchA}
    ${branchB}
  </g>`;
}

export function getFallbackPhoto(seedInput: string) {
  const seed = hashString(seedInput || 'fallback');
  const random = seededRandom(seed);
  const baseHue = Math.floor(random() * 360);
  const secondaryHue = (baseHue + 36 + Math.floor(random() * 72)) % 360;
  const accentHue = (baseHue + 180 + Math.floor(random() * 60)) % 360;

  const gradients = `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${baseHue} 46% 18%)"/>
      <stop offset="45%" stop-color="hsl(${secondaryHue} 54% 24%)"/>
      <stop offset="100%" stop-color="hsl(${accentHue} 52% 16%)"/>
    </linearGradient>`;

  const fractalGroup = Array.from({ length: 3 }, (_, index) => {
    const x = 180 + random() * 840;
    const y = 40 + random() * 280;
    const size = 80 + random() * 120;
    const depth = 3 + (index % 2);
    const angle = random() * Math.PI * 2;
    const hue = (baseHue + index * 36 + random() * 40) % 360;

    return createFractalBranch(x, y, size, depth, angle, hue);
  }).join('');

  const bubbles = Array.from({ length: 24 }, () => {
    const x = (random() * 1200).toFixed(2);
    const y = (random() * 360).toFixed(2);
    const radius = (3 + random() * 18).toFixed(2);
    const hue = ((baseHue + random() * 90) % 360).toFixed(0);
    const alpha = (0.08 + random() * 0.16).toFixed(2);

    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="hsla(${hue} 88% 76% / ${alpha})"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" role="img" aria-label="Generated hero pattern">
    <defs>${gradients}</defs>
    <rect width="1200" height="360" fill="url(#bg)"/>
    ${fractalGroup}
    ${bubbles}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
