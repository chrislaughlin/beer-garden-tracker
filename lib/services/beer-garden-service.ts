import { demoBeerGardens } from '@/lib/data/demo-data';
import { BeerGarden } from '@/lib/types';

export const beerGardenService = {
  listNearby(query?: string, filters: string[] = []) {
    return demoBeerGardens
      .filter((venue) => venue.region === 'belfast')
      .filter((venue) => !query || venue.name.toLowerCase().includes(query.toLowerCase()) || venue.address?.toLowerCase().includes(query.toLowerCase()))
      .filter((venue) => filters.length === 0 || filters.every((filter) => venue.tags.includes(filter)))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  },
  getBySlug(slug: string) {
    return demoBeerGardens.find((venue) => venue.slug === slug);
  },
  getById(id: string) {
    return demoBeerGardens.find((venue) => venue.id === id);
  },
  listForAdmin(status?: string) {
    return status ? demoBeerGardens.filter((venue) => venue.status === status) : demoBeerGardens;
  }
};
