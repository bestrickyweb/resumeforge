import { FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  textClassName,
}: {
  className?: string
  textClassName?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <FileCheck2 className="h-5 w-5" />
      </span>
      <span
        className={cn(
          'font-heading text-lg font-extrabold tracking-tight',
          textClassName,
        )}
      >
        Resume<span className="text-primary">Forge</span>
      </span>
    </div>
  )
}
