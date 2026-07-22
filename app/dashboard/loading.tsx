import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}
