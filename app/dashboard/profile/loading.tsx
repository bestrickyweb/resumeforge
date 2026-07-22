import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mt-8 space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
