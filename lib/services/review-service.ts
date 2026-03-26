import { getPublicServerClient } from '@/lib/supabase';

type ReviewListRow = {
  id: string;
  text: string;
  status: string;
  created_at: string;
  beer_garden_id: string;
  beer_gardens: { name: string | null; slug: string | null } | Array<{ name: string | null; slug: string | null }> | null;
};

function getVenueName(beerGarden: ReviewListRow['beer_gardens']) {
  if (Array.isArray(beerGarden)) {
    return beerGarden[0]?.name ?? 'Unknown venue';
  }

  return beerGarden?.name ?? 'Unknown venue';
}

export const reviewService = {
  async listRecent() {
    const supabase = await getPublicServerClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, text, status, created_at, beer_garden_id, beer_gardens(name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as ReviewListRow[]).map((review) => ({
      id: review.id,
      text: review.text,
      status: review.status,
      createdAt: review.created_at,
      venueId: review.beer_garden_id,
      venueSlug: Array.isArray(review.beer_gardens)
        ? review.beer_gardens[0]?.slug ?? null
        : review.beer_gardens?.slug ?? null,
      venueName: getVenueName(review.beer_gardens)
    }));
  }
};
