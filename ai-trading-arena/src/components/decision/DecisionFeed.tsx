'use client'

import { useRealtimeDecisions } from '@/hooks/useRealtimeDecisions'
import { DecisionCard } from './DecisionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DecisionFeedProps {
  modelId?: string
  limit?: number
  showModel?: boolean
}

function DecisionFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full mb-3" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

export function DecisionFeed({ modelId, limit = 20, showModel = true }: DecisionFeedProps) {
  const { decisions, isLoading, refetch } = useRealtimeDecisions(modelId, limit)

  if (isLoading) return <DecisionFeedSkeleton />

  if (decisions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-4">📭</p>
        <p>No decisions yet</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Decisions</h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            showModel={showModel}
          />
        ))}
      </div>
    </div>
  )
}
