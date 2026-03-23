import { demoBeerGardens } from '@/lib/data/demo-data';

export const duplicateDetectionService = {
  findPossibleDuplicates(name: string) {
    const needle = name.trim().toLowerCase();
    return demoBeerGardens.filter((venue) => venue.name.toLowerCase().includes(needle) || needle.split(' ').some((part) => part.length > 3 && venue.name.toLowerCase().includes(part))).slice(0, 3);
  }
};
