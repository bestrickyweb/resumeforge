import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  )
}
