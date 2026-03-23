import { photoService } from '@/lib/services/photo-service';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminPhotosPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const pending = await photoService.listPending();
  return <div className="space-y-5"><div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin photos</p><h1 className="text-3xl font-bold">Photo moderation</h1></div><Card className="p-5 text-sm text-slate-600">{pending.length ? `${pending.length} photos awaiting moderation.` : 'No photos waiting right now — handy for an early MVP.'}</Card></div>;
}
