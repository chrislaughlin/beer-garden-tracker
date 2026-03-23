import { demoBeerGardens } from '@/lib/data/demo-data';

export const photoService = {
  listPending() {
    return demoBeerGardens.flatMap((venue) => venue.photos.map((photo) => ({ ...photo, venueName: venue.name }))).filter((photo) => photo.moderationStatus !== 'approved');
  }
};
