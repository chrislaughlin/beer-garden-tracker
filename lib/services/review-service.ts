import { demoBeerGardens } from '@/lib/data/demo-data';

export const reviewService = {
  listRecent() {
    return demoBeerGardens.flatMap((venue) => venue.reviews.map((review) => ({ ...review, venueName: venue.name }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};
