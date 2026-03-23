import { demoBeerGardens } from '@/lib/data/demo-data';
import { BeerGarden, VenueStatus } from '@/lib/types';

export const beerGardenService = {
  listNearby(query?: string, filters: string[] = [], statuses: VenueStatus[] = ['approved', 'pending']) {
    return demoBeerGardens
      .filter((venue) => venue.region === 'belfast')
      .filter((venue) => statuses.includes(venue.status))
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
  },
  getHomepageSummary() {
    const visibleVenues = this.listNearby();
    return {
      totalVisible: visibleVenues.length,
      sunnyNow: visibleVenues.filter((venue) => venue.hasEveningSun).length,
      awaitingApproval: demoBeerGardens.filter((venue) => venue.status === 'pending').length
    };
  }
} satisfies {
  listNearby: (query?: string, filters?: string[], statuses?: VenueStatus[]) => BeerGarden[];
  getBySlug: (slug: string) => BeerGarden | undefined;
  getById: (id: string) => BeerGarden | undefined;
  listForAdmin: (status?: string) => BeerGarden[];
  getHomepageSummary: () => { totalVisible: number; sunnyNow: number; awaitingApproval: number };
};
