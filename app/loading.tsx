import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
          <Skeleton className="h-4 w-40 bg-amber-200/50" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-8 w-72 bg-white/30" />
            <Skeleton className="h-8 w-5/6 bg-white/20" />
            <Skeleton className="h-8 w-4/6 bg-white/20" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Skeleton className="h-11 w-36 rounded-full bg-white/25" />
            <Skeleton className="h-11 w-48 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/80 p-5 shadow-soft">
          <Skeleton className="h-4 w-32 bg-amber-200/70" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-[2rem] bg-white/80 p-5 shadow-soft">
          <Skeleton className="h-52 w-full rounded-[1.5rem]" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-64" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-[1.5rem] bg-white p-4 shadow-soft">
              <Skeleton className="h-40 w-full rounded-[1.25rem]" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
