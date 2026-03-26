const HERO_WIDTH = 1200;
const HERO_HEIGHT = 480;

let extractorPromise: Promise<((text: string, options?: Record<string, unknown>) => Promise<{ data: Float32Array | number[] }>) | null> | null = null;

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

function buildRecursiveLayer(random: () => number, depth: number, x: number, y: number, radius: number, hue: number): string {
  if (depth <= 0 || radius < 8) {
    return '';
  }

  const opacity = Math.max(0.07, 0.3 - depth * 0.04);
  const ringStroke = Math.max(1.5, radius * 0.05);
  const hueShift = random() * 60 - 30;
  const ring = `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="none" stroke="${hsl(hue + hueShift, 62, 72, opacity)}" stroke-width="${ringStroke.toFixed(2)}" />`;

  const childRadius = radius * (0.42 + random() * 0.12);
  const offsets = [
    [-radius * 0.66, 0],
    [radius * 0.66, 0],
    [0, -radius * 0.66],
    [0, radius * 0.66]
  ];

  const children = offsets
    .map(([dx, dy]) => buildRecursiveLayer(random, depth - 1, x + dx, y + dy, childRadius, hue + 6))
    .join('');

  return `${ring}${children}`;
}

async function loadExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      try {
        const dynamicImporter = new Function('name', 'return import(name);') as (name: string) => Promise<Record<string, unknown>>;
        const transformers = await dynamicImporter('@xenova/transformers');
        const env = transformers.env as { allowLocalModels: boolean; useBrowserCache: boolean };
        const pipeline = transformers.pipeline as (task: string, model: string) => Promise<(
          text: string,
          options?: Record<string, unknown>
        ) => Promise<{ data: Float32Array | number[] }>>;

        env.allowLocalModels = false;
        env.useBrowserCache = false;

        return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      } catch {
        return null;
      }
    })();
  }

  return extractorPromise;
}

function normalizedFromHash(text: string, dimensions = 24) {
  const seed = hashString(text || 'fallback');
  const random = createSeededRandom(seed);
  return Array.from({ length: dimensions }, () => random());
}

export async function generateHeroImageDataUri(name: string, description = '', tags: string[] = []) {
  const prompt = [name, description, tags.join(' ')].filter(Boolean).join(' · ');
  const model = await loadExtractor();

  let vector = normalizedFromHash(prompt, 24);
  if (model) {
    try {
      const output = await model(prompt, { pooling: 'mean', normalize: true });
      const values = Array.from(output.data);
      if (values.length >= 24) {
        vector = values.slice(0, 24).map((value) => (value + 1) / 2);
      }
    } catch {
      // fallback to deterministic hash vector
    }
  }

  const fallbackSeed = hashString(prompt || name);
  const random = createSeededRandom(fallbackSeed);
  const baseHue = ((vector[0] ?? random()) * 360 + 360) % 360;
  const secondaryHue = (baseHue + 36 + (vector[1] ?? random()) * 74) % 360;
  const accentHue = (secondaryHue + 96 + (vector[2] ?? random()) * 50) % 360;
  const depth = 3 + Math.round((vector[3] ?? 0.5) * 2);

  const background = [
    `<defs>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="${hsl(baseHue, 46, 24)}"/>`,
    `<stop offset="55%" stop-color="${hsl(secondaryHue, 52, 34)}"/>`,
    `<stop offset="100%" stop-color="${hsl(accentHue, 58, 24)}"/>`,
    `</linearGradient>`,
    `<radialGradient id="glow" cx="0.85" cy="0.2" r="0.75">`,
    `<stop offset="0%" stop-color="${hsl(accentHue, 90, 70, 0.34)}"/>`,
    `<stop offset="100%" stop-color="${hsl(accentHue, 90, 70, 0)}"/>`,
    `</radialGradient>`,
    `</defs>`
  ].join('');

  const maxRadius = HERO_HEIGHT * (0.24 + (vector[4] ?? random()) * 0.2);
  const circles = buildRecursiveLayer(random, depth, HERO_WIDTH * 0.5, HERO_HEIGHT * 0.5, maxRadius, baseHue);

  const dotCount = 14 + Math.round((vector[5] ?? random()) * 16);
  const dots = Array.from({ length: dotCount }, (_, index) => {
    const cx = (vector[index % vector.length] ?? random()) * HERO_WIDTH;
    const cy = (vector[(index + 3) % vector.length] ?? random()) * HERO_HEIGHT;
    const r = 2 + (vector[(index + 7) % vector.length] ?? random()) * 8;
    const opacity = 0.08 + (vector[(index + 11) % vector.length] ?? random()) * 0.2;
    return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${hsl(accentHue + random() * 30, 74, 78, opacity)}" />`;
  }).join('');

  const safeName = escapeXml(name || 'Beer garden');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HERO_WIDTH} ${HERO_HEIGHT}" role="img" aria-label="Generated hero art for ${safeName}"><rect width="${HERO_WIDTH}" height="${HERO_HEIGHT}" fill="url(#bg)"/><rect width="${HERO_WIDTH}" height="${HERO_HEIGHT}" fill="url(#glow)"/>${dots}${circles}</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
