export type VenueStatus = 'pending' | 'approved' | 'flagged' | 'rejected' | 'closed';
export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

export interface Photo {
  id: string;
  beerGardenId?: string;
  reviewId?: string;
  storagePath: string;
  uploadedByUserId: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
  url: string;
}

export interface Review {
  id: string;
  beerGardenId: string;
  userId: string;
  rating: number;
  text: string;
  sunnyWhenVisited?: boolean;
  status: ModerationStatus;
  createdAt: string;
  tags: string[];
  photos?: Photo[];
}

export interface BeerGarden {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  region: 'belfast';
  source: 'user' | 'seed' | 'admin';
  hasEveningSun?: boolean;
  status: VenueStatus;
  confidenceScore: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  distanceMeters: number;
  rating: number;
  reviewCount: number;
  photos: Photo[];
  reviews: Review[];
  sunsetTime: string;
}

export interface ChangeRequest {
  id: string;
  beerGardenId: string;
  type: 'duplicate' | 'edit' | 'closed' | 'photo' | 'review';
  reason: string;
  createdAt: string;
}
