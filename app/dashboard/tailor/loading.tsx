import { Skeleton } from '@/components/ui/skeleton'

export default function TailorLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mt-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  )
}
