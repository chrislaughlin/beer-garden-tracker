import { z } from 'zod';

export const addVenueSchema = z.object({
  name: z.string().min(2).max(120),
  lat: z.number(),
  lng: z.number(),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  region: z.literal('belfast'),
  hasEveningSun: z.boolean().optional(),
  tags: z.array(z.string()).max(8)
});

export const reviewSchema = z.object({
  beerGardenId: z.string().uuid().or(z.string().min(1)),
  rating: z.number().min(1).max(5),
  text: z.string().min(3).max(500),
  sunnyWhenVisited: z.boolean().optional(),
  tags: z.array(z.string()).max(8)
});
