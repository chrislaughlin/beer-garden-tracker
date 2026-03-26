const HERO_WIDTH = 1200;
const HERO_HEIGHT = 480;

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hsl(hue: number, saturation: number, lightness: number, alpha = 1) {
  return `hsla(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%, ${alpha})`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildRecursiveLayer(random: () => number, depth: number, x: number, y: number, radius: number): string {
  if (depth <= 0 || radius < 8) {
    return '';
  }

  const opacity = 0.32 - depth * 0.04;
  const ringStroke = Math.max(1.5, radius * 0.05);
  const hueShift = random() * 45 - 22;
  const ring = `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="none" stroke="${hsl(192 + hueShift, 62, 72, Math.max(opacity, 0.08))}" stroke-width="${ringStroke.toFixed(2)}" />`;

  const childRadius = radius * (0.44 + random() * 0.08);
  const offsets = [
    [-radius * 0.66, 0],
    [radius * 0.66, 0],
    [0, -radius * 0.66],
    [0, radius * 0.66]
  ];

  const children = offsets
    .map(([dx, dy]) => buildRecursiveLayer(random, depth - 1, x + dx, y + dy, childRadius))
    .join('');

  return `${ring}${children}`;
}

export function getFallbackPhoto(seedText: string) {
  const seed = hashString(seedText || 'beer-garden-fallback');
  const random = createSeededRandom(seed);
  const baseHue = (seed % 360 + 360) % 360;
  const secondaryHue = (baseHue + 52 + Math.floor(random() * 32)) % 360;
  const accentHue = (secondaryHue + 140) % 360;

  const background = [
    `<defs>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="${hsl(baseHue, 48, 25)}"/>`,
    `<stop offset="50%" stop-color="${hsl(secondaryHue, 52, 33)}"/>`,
    `<stop offset="100%" stop-color="${hsl(accentHue, 54, 23)}"/>`,
    `</linearGradient>`,
    `<radialGradient id="glow" cx="0.85" cy="0.25" r="0.7">`,
    `<stop offset="0%" stop-color="${hsl(baseHue + 24, 85, 72, 0.32)}"/>`,
    `<stop offset="100%" stop-color="${hsl(baseHue + 24, 85, 72, 0)}"/>`,
    `</radialGradient>`,
    `</defs>`
  ].join('');

  const circles = buildRecursiveLayer(random, 4, HERO_WIDTH * 0.5, HERO_HEIGHT * 0.5, HERO_HEIGHT * 0.32);

  const dots = Array.from({ length: 18 }, () => {
    const cx = random() * HERO_WIDTH;
    const cy = random() * HERO_HEIGHT;
    const r = 2 + random() * 10;
    const opacity = 0.08 + random() * 0.2;
    return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${hsl(accentHue + random() * 30, 70, 78, opacity)}" />`;
  }).join('');

  const safeSeedText = escapeXml(seedText);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HERO_WIDTH} ${HERO_HEIGHT}" role="img" aria-label="Generated hero art for ${safeSeedText}"><rect width="${HERO_WIDTH}" height="${HERO_HEIGHT}" fill="url(#bg)"/><rect width="${HERO_WIDTH}" height="${HERO_HEIGHT}" fill="url(#glow)"/>${dots}${circles}</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
