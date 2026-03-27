import { Skeleton } from '../ui/skeleton'

export function WebhookDetailSkeleton() {
  const rowIds = Array.from({ length: 4 }, () => crypto.randomUUID())
  const queryIds = Array.from({ length: 3 }, () => crypto.randomUUID())
  const headerIds = Array.from({ length: 4 }, () => crypto.randomUUID())

  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="space-y-4 border-b border-zinc-700 p-6 pb-6.75">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-14 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <span className="w-px h-4 bg-zinc-700" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Request Overview Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="overflow-hidden rounded-lg border border-zinc-700">
              {headerIds.map((id) => (
                <div
                  key={id}
                  className="flex border-b border-zinc-700 last:border-0"
                >
                  <div className="w-1/3 p-3 bg-zinc-800/50 border-r border-zinc-700">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex-1 p-3">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Parameters Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="overflow-hidden rounded-lg border border-zinc-700">
              {rowIds.map((id) => (
                <div
                  key={id}
                  className="flex border-b border-zinc-700 last:border-0"
                >
                  <div className="w-1/3 p-3 bg-zinc-800/50 border-r border-zinc-700">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex-1 p-3">
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Headers Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-16" />
            <div className="overflow-hidden rounded-lg border border-zinc-700">
              {queryIds.map((id) => (
                <div
                  key={id}
                  className="flex border-b border-zinc-700 last:border-0"
                >
                  <div className="w-1/3 p-3 bg-zinc-800/50 border-r border-zinc-700">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex-1 p-3">
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Body Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-11/12 mb-2" />
              <Skeleton className="h-4 w-10/12 mb-2" />
              <Skeleton className="h-4 w-11/12 mb-2" />
              <Skeleton className="h-4 w-8/12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
