import { getPublicServerClient } from '@/lib/supabase';

type ReviewListRow = {
  id: string;
  text: string;
  status: string;
  created_at: string;
  beer_gardens: { name: string | null } | Array<{ name: string | null }> | null;
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
      .select('id, text, status, created_at, beer_gardens(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as ReviewListRow[]).map((review) => ({
      id: review.id,
      text: review.text,
      status: review.status,
      createdAt: review.created_at,
      venueName: getVenueName(review.beer_gardens)
    }));
  }
};
