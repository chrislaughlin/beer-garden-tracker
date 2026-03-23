import { demoBeerGardens, demoReports } from '@/lib/data/demo-data';
import { reviewService } from '@/lib/services/review-service';

export const adminModerationService = {
  getMetrics() {
    return {
      pendingVenues: demoBeerGardens.filter((venue) => venue.status === 'pending').length,
      flaggedVenues: demoBeerGardens.filter((venue) => venue.status === 'flagged').length,
      openReports: demoReports.length,
      recentReviews: reviewService.listRecent().length
    };
  },
  listReports() {
    return demoReports;
  }
};
