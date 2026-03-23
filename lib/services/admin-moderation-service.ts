import { getPublicServerClient } from '@/lib/supabase';
import { reviewService } from '@/lib/services/review-service';

export const adminModerationService = {
  async getMetrics() {
    const supabase = await getPublicServerClient();
    const [pendingVenuesResult, flaggedVenuesResult, reportsResult, recentReviews] = await Promise.all([
      supabase.from('beer_gardens').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('beer_gardens').select('id', { count: 'exact', head: true }).eq('status', 'flagged'),
      supabase.from('change_requests').select('id', { count: 'exact', head: true }),
      reviewService.listRecent()
    ]);

    if (pendingVenuesResult.error) {
      throw pendingVenuesResult.error;
    }

    if (flaggedVenuesResult.error) {
      throw flaggedVenuesResult.error;
    }

    if (reportsResult.error) {
      throw reportsResult.error;
    }

    return {
      pendingVenues: pendingVenuesResult.count ?? 0,
      flaggedVenues: flaggedVenuesResult.count ?? 0,
      openReports: reportsResult.count ?? 0,
      recentReviews: recentReviews.length
    };
  },
  async listReports() {
    const supabase = await getPublicServerClient();
    const { data, error } = await supabase.from('change_requests').select('id, beer_garden_id, type, reason, created_at').order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((report) => ({
      id: report.id,
      beerGardenId: report.beer_garden_id,
      type: report.type,
      reason: report.reason,
      createdAt: report.created_at
    }));
  }
};
