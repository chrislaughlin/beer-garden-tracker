export type HeroImageInput = {
  name: string;
  description?: string;
  tags?: string[];
};

export function getFallbackPhoto({ name, description, tags }: HeroImageInput) {
  const query = new URLSearchParams({
    name: name || 'Beer garden',
    description: description || '',
    tags: (tags || []).join('|')
  });

  return `/api/hero-image?${query.toString()}`;
}
