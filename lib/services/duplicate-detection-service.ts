import { getPublicServerClient } from '@/lib/supabase';

export const duplicateDetectionService = {
  async findPossibleDuplicates(name: string) {
    const needle = name.trim().toLowerCase();

    if (!needle) {
      return [];
    }

    const supabase = await getPublicServerClient();
    const { data, error } = await supabase
      .from('beer_gardens')
      .select('id, slug, name, address')
      .eq('region', 'belfast')
      .order('updated_at', { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    return (data ?? [])
      .filter((venue) => venue.name.toLowerCase().includes(needle) || needle.split(' ').some((part) => part.length > 3 && venue.name.toLowerCase().includes(part)))
      .slice(0, 3);
  }
};
