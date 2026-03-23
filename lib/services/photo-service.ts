import { getPublicServerClient } from '@/lib/supabase';

type PhotoListRow = {
  id: string;
  storage_path: string;
  moderation_status: string;
  created_at: string;
  beer_gardens: { name: string | null } | Array<{ name: string | null }> | null;
};

function getVenueName(beerGarden: PhotoListRow['beer_gardens']) {
  if (Array.isArray(beerGarden)) {
    return beerGarden[0]?.name ?? 'Unknown venue';
  }

  return beerGarden?.name ?? 'Unknown venue';
}

export const photoService = {
  async listPending() {
    const supabase = await getPublicServerClient();
    const { data, error } = await supabase
      .from('photos')
      .select('id, storage_path, moderation_status, created_at, beer_gardens(name)')
      .neq('moderation_status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as PhotoListRow[]).map((photo) => ({
      id: photo.id,
      storagePath: photo.storage_path,
      moderationStatus: photo.moderation_status,
      createdAt: photo.created_at,
      venueName: getVenueName(photo.beer_gardens)
    }));
  }
};
