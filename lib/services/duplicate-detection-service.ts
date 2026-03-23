import { demoBeerGardens } from '@/lib/data/demo-data';

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNameScore(a: string, b: string) {
  const aWords = a.toLowerCase().split(/\W+/).filter(Boolean);
  const bWords = b.toLowerCase().split(/\W+/).filter(Boolean);
  const shared = aWords.filter((word) => bWords.includes(word)).length;
  return shared / Math.max(new Set([...aWords, ...bWords]).size, 1);
}

export const duplicateDetectionService = {
  findPossibleDuplicates(name: string, lat?: number, lng?: number) {
    return demoBeerGardens
      .map((venue) => {
        const nameScore = getNameScore(name, venue.name);
        const distanceMeters = lat !== undefined && lng !== undefined ? getDistanceMeters(lat, lng, venue.lat, venue.lng) : venue.distanceMeters;
        return { ...venue, nameScore, distanceMeters };
      })
      .filter((venue) => venue.nameScore > 0.2 || venue.distanceMeters < 250)
      .sort((a, b) => (b.nameScore === a.nameScore ? a.distanceMeters - b.distanceMeters : b.nameScore - a.nameScore))
      .slice(0, 4);
  }
};
