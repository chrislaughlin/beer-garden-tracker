import { Skeleton } from '@/components/ui/skeleton';

export default function BeerGardenDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-14 w-full rounded-2xl border border-amber-100 bg-amber-50" />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="relative h-40 w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <Skeleton className="h-4 w-28 bg-amber-200/70" />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-72 bg-white/30" />
                <Skeleton className="h-4 w-96 bg-white/20" />
              </div>
              <Skeleton className="h-16 w-28 rounded-3xl bg-white/25" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-7 w-20 rounded-full" />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <Skeleton className="h-6 w-48" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-2 rounded-2xl bg-muted p-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-soft">
            <Skeleton className="h-4 w-28 bg-amber-200/70" />
            <Skeleton className="mt-3 h-7 w-56 bg-white/30" />
            <Skeleton className="mt-3 h-16 w-full rounded-2xl bg-white/10" />
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-52 w-full rounded-[1.5rem]" />
            <Skeleton className="mt-3 h-4 w-2/3" />
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-11 w-full rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
