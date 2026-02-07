'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AIDecision } from '@/types/database'

interface DecisionWithModel extends AIDecision {
  model_name?: string
  provider?: string
}

export function useRealtimeDecisions(modelId?: string, limit = 50) {
  const [decisions, setDecisions] = useState<DecisionWithModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDecisions = useCallback(async () => {
    const supabase = createClient()

    // Fetch models for names
    const { data: models } = await supabase
      .from('ai_models')
      .select('id, name, provider')

    // Fetch decisions
    let query = supabase
      .from('ai_decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (modelId) {
      query = query.eq('model_id', modelId)
    }

    const { data: decisionsData } = await query

    if (decisionsData && models) {
      const combined = decisionsData.map(d => {
        const model = models.find(m => m.id === d.model_id)
        return {
          ...d,
          model_name: model?.name || 'Unknown',
          provider: model?.provider || 'unknown'
        }
      })
      setDecisions(combined)
    }

    setIsLoading(false)
  }, [modelId, limit])

  useEffect(() => {
    fetchDecisions()

    const supabase = createClient()

    // Subscribe to new decisions
    const channel = supabase
      .channel('decision-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_decisions'
        },
        () => {
          fetchDecisions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchDecisions])

  return { decisions, isLoading, refetch: fetchDecisions }
}
