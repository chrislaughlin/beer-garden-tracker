import { Skeleton } from '@/components/ui/skeleton';

export default function ExploreLoading() {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-white/80 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-56" />
          </div>
          <Skeleton className="h-9 w-10 rounded-full" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <section className="rounded-[2rem] bg-white/80 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-52" />
            <Skeleton className="mt-2 h-6 w-64" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-[1.5rem] border border-amber-100 bg-white p-4 shadow-soft">
              <Skeleton className="h-44 w-full rounded-[1.25rem]" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
