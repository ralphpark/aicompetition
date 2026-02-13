import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-4 hidden md:block" />
            <Skeleton className="w-20 h-4 hidden md:block" />
            <Skeleton className="w-20 h-4 hidden md:block" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="w-64 h-10 mx-auto mb-4" />
          <Skeleton className="w-96 h-6 mx-auto" />
        </div>

        {/* Racing Track Skeleton */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6">
            <Skeleton className="w-64 h-8 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-8" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <Skeleton className="w-12 h-12 mb-4" />
              <Skeleton className="w-24 h-5 mb-2" />
              <Skeleton className="w-full h-4" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
