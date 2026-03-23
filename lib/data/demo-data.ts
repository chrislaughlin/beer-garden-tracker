import { BeerGarden, ChangeRequest } from '@/lib/types';

export const demoBeerGardens: BeerGarden[] = [
  {
    id: '1',
    slug: 'sunset-yard-cathedral-quarter',
    name: 'Sunset Yard',
    lat: 54.6012,
    lng: -5.9257,
    address: 'Cathedral Quarter, Belfast',
    description: 'Cosy courtyard tables, string lights, and a reliable late glow when the weather behaves.',
    region: 'belfast',
    source: 'seed',
    hasEveningSun: true,
    status: 'approved',
    confidenceScore: 0.94,
    createdByUserId: 'seed-admin',
    createdAt: '2026-03-20T16:10:00Z',
    updatedAt: '2026-03-22T16:10:00Z',
    tags: ['Sunny spot', 'Good atmosphere', 'Covered seating'],
    distanceMeters: 450,
    rating: 4.7,
    reviewCount: 12,
    sunsetTime: '2026-03-23T18:39:00Z',
    photos: [
      {
        id: 'p1', storagePath: 'venues/sunset-yard.jpg', uploadedByUserId: 'seed-admin', moderationStatus: 'approved', createdAt: '2026-03-20T16:10:00Z', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80', beerGardenId: '1'
      }
    ],
    reviews: [
      { id: 'r1', beerGardenId: '1', userId: 'anon-1', rating: 5, text: 'Great golden-hour pint spot with plenty of room even after work.', sunnyWhenVisited: true, status: 'approved', createdAt: '2026-03-22T18:10:00Z', tags: ['Sunny spot', 'Good atmosphere'] }
    ]
  },
  {
    id: '2',
    slug: 'harbour-hops-titanic-quarter',
    name: 'Harbour Hops',
    lat: 54.6074,
    lng: -5.9042,
    address: 'Titanic Quarter, Belfast',
    description: 'Open deck near the water with broad tables and a breezy feel.',
    region: 'belfast', source: 'seed', hasEveningSun: false, status: 'approved', confidenceScore: 0.88, createdByUserId: 'seed-admin', createdAt: '2026-03-20T16:10:00Z', updatedAt: '2026-03-21T16:10:00Z', tags: ['Food available', 'Busy'], distanceMeters: 1900, rating: 4.3, reviewCount: 8, sunsetTime: '2026-03-23T18:39:00Z', photos: [{ id: 'p2', storagePath: 'venues/harbour-hops.jpg', uploadedByUserId: 'seed-admin', moderationStatus: 'approved', createdAt: '2026-03-20T16:10:00Z', url: 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=1200&q=80', beerGardenId: '2' }], reviews: []
  },
  {
    id: '3',
    slug: 'botanic-terrace-house',
    name: 'Botanic Terrace House',
    lat: 54.5839,
    lng: -5.9345,
    address: 'Botanic Avenue, Belfast',
    description: 'Leafy back terrace hidden just off the main stretch, ideal for a quieter catch-up.',
    region: 'belfast', source: 'seed', hasEveningSun: true, status: 'pending', confidenceScore: 0.71, createdByUserId: 'anon-7', createdAt: '2026-03-22T13:22:00Z', updatedAt: '2026-03-22T13:22:00Z', tags: ['Quiet', 'Dog friendly'], distanceMeters: 2400, rating: 4.1, reviewCount: 2, sunsetTime: '2026-03-23T18:39:00Z', photos: [], reviews: []
  }
];

export const demoReports: ChangeRequest[] = [
  { id: 'c1', beerGardenId: '3', type: 'edit', reason: 'Pin is a touch off — seating is in the lane behind the pub.', createdAt: '2026-03-23T12:05:00Z' },
  { id: 'c2', beerGardenId: '2', type: 'duplicate', reason: 'Looks like the same venue as Harbour Hop Belfast on Google.', createdAt: '2026-03-23T15:40:00Z' }
];

export const trustedAdminUserIds = ['admin-demo-user-id'];
