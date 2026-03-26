const SVG_WIDTH = 1200;
const SVG_HEIGHT = 640;
const TILE_SIZE = 160;

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hsl(hue: number, saturation: number, lightness: number, alpha = 1) {
  return `hsla(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%, ${alpha})`;
}

type Shape = {
  x: number;
  y: number;
  size: number;
  depth: number;
};

function buildRecursiveShapes(shape: Shape, rng: () => number, output: string[]) {
  const { x, y, size, depth } = shape;

  if (depth <= 0 || size < 20) {
    return;
  }

  const baseHue = rng() * 360;
  const fill = hsl(baseHue, 46 + rng() * 25, 38 + rng() * 18, 0.42 + rng() * 0.28);
  const stroke = hsl((baseHue + 30 + rng() * 60) % 360, 50, 72, 0.34);
  const radius = Math.max(6, size * (0.18 + rng() * 0.15));

  output.push(
    `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${radius.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="1.1" />`
  );

  const inset = size * (0.11 + rng() * 0.08);
  const nextSize = (size - inset * 2) / 2;

  if (nextSize < 14) {
    return;
  }

  const quadrants = [
    { x: x + inset, y: y + inset },
    { x: x + inset + nextSize, y: y + inset },
    { x: x + inset, y: y + inset + nextSize },
    { x: x + inset + nextSize, y: y + inset + nextSize }
  ];

  quadrants.forEach((quadrant) => {
    if (rng() > 0.25) {
      buildRecursiveShapes({ x: quadrant.x, y: quadrant.y, size: nextSize, depth: depth - 1 }, rng, output);
    }
  });
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getFallbackPhoto(seedText: string) {
  const seed = hashString(seedText || 'beer-garden');
  const rng = createSeededRandom(seed);

  const hueA = Math.floor(rng() * 360);
  const hueB = (hueA + 28 + Math.floor(rng() * 70)) % 360;
  const hueC = (hueA + 180 + Math.floor(rng() * 70)) % 360;

  const backgroundGradient = [
    hsl(hueA, 38 + rng() * 20, 18 + rng() * 8),
    hsl(hueB, 42 + rng() * 25, 22 + rng() * 10),
    hsl(hueC, 45 + rng() * 22, 26 + rng() * 10)
  ];

  const shapes: string[] = [];
  for (let y = -40; y < SVG_HEIGHT + TILE_SIZE; y += TILE_SIZE) {
    for (let x = -40; x < SVG_WIDTH + TILE_SIZE; x += TILE_SIZE) {
      buildRecursiveShapes({ x, y, size: TILE_SIZE * (0.9 + rng() * 0.35), depth: 3 }, rng, shapes);
    }
  }

  const noiseDots: string[] = [];
  for (let index = 0; index < 90; index += 1) {
    const cx = rng() * SVG_WIDTH;
    const cy = rng() * SVG_HEIGHT;
    const radius = 0.7 + rng() * 1.8;
    const color = hsl((hueA + rng() * 90) % 360, 48, 84, 0.1 + rng() * 0.2);
    noiseDots.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}" />`);
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="Generated visual pattern for ${seedText}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${backgroundGradient[0]}" />
      <stop offset="52%" stop-color="${backgroundGradient[1]}" />
      <stop offset="100%" stop-color="${backgroundGradient[2]}" />
    </linearGradient>
    <radialGradient id="light" cx="0.2" cy="0.1" r="0.9">
      <stop offset="0%" stop-color="${hsl(hueB, 85, 92, 0.34)}" />
      <stop offset="100%" stop-color="${hsl(hueB, 50, 25, 0)}" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#light)" />
  ${shapes.join('\n  ')}
  ${noiseDots.join('\n  ')}
</svg>`.trim();

  return encodeSvg(svg);
}
