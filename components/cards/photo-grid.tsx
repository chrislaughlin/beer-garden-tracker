import Image from 'next/image';
import { Photo } from '@/lib/types';

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative h-32 overflow-hidden rounded-3xl bg-muted">
          <Image src={photo.url} alt="Venue photo" fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
