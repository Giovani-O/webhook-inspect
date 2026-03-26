import { Skeleton } from '../ui/skeleton'

export function SidebarSkeleton() {
  const skeletonIds = Array.from({ length: 8 }, () => crypto.randomUUID())

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {skeletonIds.map((id) => (
          <div key={id} className="flex items-start gap-3 px-4 py-2.5">
            <Skeleton className="size-4 shrink-0 rounded" />
            <Skeleton className="w-12 h-4 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
